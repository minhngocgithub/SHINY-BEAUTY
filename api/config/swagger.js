const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "Complete E-Commerce Platform API with Socket.IO Real-time Features",
      contact: {
        name: "API Support",
        email: "support@ecommerce.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Development Server",
      },
      {
        url: process.env.PRODUCTION_URL || "https://api.ecommerce.com",
        description: "Production Server",
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routers/*.js", "./controller/*.js"],
}

const specs = swaggerJsdoc(options)

module.exports = {
  swaggerUi,
  specs,
}
