import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Baby Shop API",
    description: "API backend endpoints for Baby Shop website",
  },
  host: "localhost:8000",
  schemes: ["http"],
  servers: [
    {
      url: "http://localhost:8000",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = "./swagger-output.json";
const routes = ["../index.ts"];

swaggerAutogen({
  openapi: "3.0.0",
  autoHeaders: false,
})(outputFile, routes, doc);
