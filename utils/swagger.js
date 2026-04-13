const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ChaguaEvent API",
      version: "1.0.0",
      description: "Surgical API Documentation for ChaguaEvent Directory Platform",
    },
    servers: [
      {
        url: "http://localhost:3005",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./controller/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger UI available at http://localhost:3005/api-docs");
};

module.exports = setupSwagger;
