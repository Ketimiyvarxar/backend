// config/swagger.js
const swaggerJsdoc   = require('swagger-jsdoc');
const swaggerUi      = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title:       'My Quiz API',
            version:     '1.0.0',
            description: 'Endpoints for auth, topics, quizzes & admin'
        },
        servers: [
            { url: `http://localhost:${process.env.PORT || 5000}` }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type:   'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    // <-- look for JSDoc comments in these files:
    apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
