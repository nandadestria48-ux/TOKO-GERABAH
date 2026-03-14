const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Toko Gerabah Online API",
      version: "1.0.0",
      description: "API Documentation untuk Toko Gerabah Online dengan Database MySQL",
      contact: {
        name: "API Support",
        email: "support@tokogerabah.com",
        url: "https://www.tokogerabah.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5050",
        description: "Development Server",
      },
      {
        url: "http://localhost:3030",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Token dari login endpoint",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            username: { type: "string", example: "pelanggan_gerabah" },
            email: { type: "string", example: "pelanggan@tokogerabah.com" },
            phone: { type: "string", example: "+62812345678" },
            address: { type: "string", example: "Jl. Keramik No. 45, Yogyakarta" },
            profilePhoto: { type: "string", example: "data:image/jpeg;base64,..." },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Vas Bunga Keramik Tradisional" },
            craftsman: { type: "string", example: "Budi Handoso" },
            price: { type: "number", format: "decimal", example: 250000 },
            category: { type: "string", example: "vas" },
            description: { type: "string", example: "Vas keramik buatan tangan dengan motif tradisional Jawa" },
            image: { type: "string", example: "https://..." },
            rating: { type: "number", format: "decimal", example: 4.8 },
            reviews: { type: "integer", example: 45 },
            discount: { type: "integer", example: 10 },
            stock: { type: "integer", example: 25 },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            order_number: { type: "string", example: "ORD-1706868000000" },
            user_id: { type: "integer", example: 1 },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" },
                  category: { type: "string" },
                  image: { type: "string" },
                  quantity: { type: "integer" },
                  price: { type: "number" },
                },
              },
            },
            total: { type: "number", format: "decimal", example: 750000 },
            status: { type: "string", enum: ["Pending", "Dikemas", "Dalam Pengiriman", "Selesai", "Dibatalkan"], example: "Dalam Pengiriman" },
            shipping_address: { type: "string", example: "Jl. Keramik No. 45, Yogyakarta" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Error message" },
          },
        },
      },
    },
  },
  apis: ["./server.js"],
};

module.exports = swaggerJsdoc(options);
