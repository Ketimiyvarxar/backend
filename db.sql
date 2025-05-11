create table users
(
    id         serial
        primary key,
    first_name varchar(50)             not null,
    last_name  varchar(50)             not null,
    user_name  varchar(50)             not null
        unique,
    email      varchar(255)            not null
        unique,
    password   varchar(255)            not null,
    created_at timestamp default now() not null,
    is_admin   boolean   default false not null
);


create table topics
(
    id   serial
        primary key,
    name text not null
        unique
);


create table quizzes
(
    id         serial
        primary key,
    topic_id   integer                 not null
        references topics
            on delete cascade,
    name       text                    not null,
    created_at timestamp default now() not null
);


create table questions
(
    id       serial
        primary key,
    quiz_id  integer not null
        references quizzes
            on delete cascade,
    text     text    not null,
    position integer not null
);


create table answers
(
    id          serial
        primary key,
    question_id integer               not null
        references questions
            on delete cascade,
    text        text                  not null,
    is_correct  boolean default false not null
);


create table quiz_attempts
(
    id       serial
        primary key,
    user_id  integer                 not null
        references users
            on delete cascade,
    quiz_id  integer                 not null
        references quizzes
            on delete cascade,
    taken_at timestamp default now() not null
);


create table quiz_attempt_answers
(
    id          serial
        primary key,
    attempt_id  integer not null
        references quiz_attempts
            on delete cascade,
    question_id integer not null
        references questions
            on delete cascade,
    answer_id   integer not null
        references answers
            on delete cascade,
    is_correct  boolean not null
);


