export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'KIBO360 Financial Accounting & Book Sellers Management Software API',
    version: '1.0.0',
    description: 'Enterprise REST API documentation for KIBO360 ERP. Supporting Publishers, Wholesalers, Distributors, Bookstores, and Educational Suppliers.',
    contact: {
      name: 'KIBO360 Architecture Team',
      email: 'api-support@kibo360.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API service health status',
        responses: {
          '200': {
            description: 'API is running and healthy',
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@kibo360.com' },
                  password: { type: 'string', example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Successful login with JWT token and user profile' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/accounting': {
      get: {
        tags: ['Accounting'],
        summary: 'Get Chart of Accounts & General Ledger data',
        responses: {
          '200': { description: 'List of account ledgers' },
        },
      },
    },
    '/books': {
      get: {
        tags: ['Books & Publishing'],
        summary: 'List book titles, ISBN-13 registry, editions',
        responses: {
          '200': { description: 'List of book titles' },
        },
      },
    },
    '/royalties': {
      get: {
        tags: ['Author Royalties'],
        summary: 'Fetch author royalty contracts and quarterly statements',
        responses: {
          '200': { description: 'Author contracts and accruals' },
        },
      },
    },
  },
};
