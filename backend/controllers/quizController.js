const {getQuizzesByTopicId, getQuizzById} = require('../models/quiz');

const {
    createAttempt,
    recordAnswersBatch,
    getAttemptsSummary,
    getAttemptDetails, getAttemptById
} = require('../models/quizAttempt');

exports.getQuizzesByTopicId = async (req, res) => {
    try {
        const topicId = parseInt(req.params.topicId, 10);
        const quizzes = await getQuizzesByTopicId(topicId);
        if (quizzes.length === 0) {
            return res.status(404).json({msg: 'No quizzes found for this topic'});
        }
        res.json({quizzes});
    } catch (err) {
        console.error(err);
        res.status(500).json({msg: 'Server error'});
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const quizId = parseInt(req.params.quizId, 10);
        const quiz = await getQuizzById(quizId);
        if (quiz.length === 0) {
            return res.status(404).json({msg: 'No quiz found with this ID'});
        }
        quiz[0].questions.forEach(q => {
            q.answers = q.answers.map(a => ({
                id: a.id,
                text: a.text
            }));
        });
        res.json({quiz});
    } catch (err) {
        console.error(err);
        res.status(500).json({msg: 'Server error'});
    }
}

exports.takeQuiz = async (req, res) => {
    const userId = req.user.id;
    const quizId = req.body.quizId;
    const userAnswers = req.body.answers;

    if (!quizId || !Array.isArray(userAnswers) || !userAnswers.length) {
        return res.status(400).json({msg: 'quizId and answers are required'});
    }
    userAnswers.forEach(userAnswer => {
        if (!userAnswer.questionId || !userAnswer.answerId) {
            return res.status(400).json({msg: 'questionId and answerId are required'});
        }
        if (isNaN(userAnswer.questionId) || isNaN(userAnswer.answerId)) {
            return res.status(400).json({msg: 'questionId and answerId must be numbers'});
        }
    })

    const quiz = await getQuizzById(quizId);


    const quizQuestionIds = new Set(quiz[0].questions.map(q => q.id));
    const userQuestionIds = new Set(userAnswers.map(a => a.questionId));

    const quizAnswerIds = {};
    const quizCorrectAnswerIds = {};
    for (const question of quiz[0].questions) {
        quizAnswerIds[question.id] = new Set(question.answers.map(a => a.id));
        quizCorrectAnswerIds[question.id] = new Set(question.answers.filter(a => a.isCorrect).map(a => a.id));
    }
    const userAnswerIds = {}
    for (const question of quiz[0].questions) {
        userAnswerIds[question.id] = userAnswers.filter(a => a.questionId === question.id).map(a => a.answerId)[0]
    }

    if (userQuestionIds.size !== quizQuestionIds.size) {
        return res.status(400).json({msg: 'Invalid questionId(s)'});
    }
    for (const questionId of userQuestionIds) {
        if (!quizQuestionIds.has(questionId)) {
            return res.status(400).json({msg: `questionId ${questionId} does not exist`});
        }
        if (!quizAnswerIds[questionId].has(userAnswerIds[questionId])) {
            return res.status(400).json({msg: `answerId ${userAnswerIds[questionId]} is not a valid answer for questionId ${questionId}`});
        }
    }

    try {
        const quizAttempt = await createAttempt(userId, quizId);

        const quizAttemptAnswersData = userAnswers.map(userAnswer => ({
            questionId: userAnswer.questionId,
            answerId: userAnswer.answerId,
            isCorrect: quizCorrectAnswerIds[userAnswer.questionId].has(userAnswer.answerId)
        }));

        const quizAttemptAnswers = await recordAnswersBatch(quizAttempt.id, quizAttemptAnswersData);

        const quizAttemptSummary = {
            attemptId: quizAttempt.id,
            takenAt: quizAttempt.taken_at,
            correctCount: quizAttemptAnswersData.filter(a => a.isCorrect).length
        };

        res.json({quizAttemptSummary});
    } catch (err) {
        console.error(err);
        res.status(500).json({msg: 'Server error'});
    }


};
exports.listAttempts = async (req, res) => {
    try {
        const userId = req.user.id;
        const quizId = parseInt(req.params.quizId, 10);
        const attempts = await getAttemptsSummary(userId, quizId);
        if (!attempts.length) {
            return res.status(404).json({msg: 'No attempts found'});
        }
        return res.json({attempts});
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: 'Server error'});
    }
};

exports.getAttempt = async (req, res) => {
    try {
        const userId = req.user.id;
        const attemptId = parseInt(req.params.attemptId, 10);

        const attempt = await getAttemptById(attemptId);
        if (!attempt) {
            return res.status(404).json({msg: 'Attempt not found'});
        }
        if (attempt.user_id !== userId) {
            return res.status(403).json({msg: 'Forbidden'});
        }

        const quizArr = await getQuizzById(attempt.quiz_id);
        if (!Array.isArray(quizArr) || !quizArr[0]) {
            return res.status(404).json({msg: 'Quiz not found'});
        }
        const quiz = quizArr[0];

        const rawDetails = await getAttemptDetails(attemptId);
        const detailMap = new Map(
            rawDetails.map(d => [d.question_id, d])
        );

        const questions = quiz.questions.map(q => {
            const picked = detailMap.get(q.id);
            return {
                id: q.id,
                text: q.text,
                position: q.position,
                answers: q.answers.map(a => ({
                    id: a.id,
                    text: a.text,
                    isCorrect: a.isCorrect,
                    selected: picked ? (a.id === picked.answer_id) : false
                })),
                userAnswerId: picked?.answer_id ?? null,
                isCorrect: picked?.is_correct ?? false
            };
        });

        // 5) Send back everything
        return res.json({
            attemptId: attempt.id,
            takenAt: attempt.taken_at,
            quiz: {
                id: quiz.quizId,
                name: quiz.quizName
            },
            questions
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: 'Server error'});
    }
};