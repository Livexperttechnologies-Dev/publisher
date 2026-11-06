import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
import { apiV1Routes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { ENV } from './config/env';

const app = express();

const allowedOrigins = ENV.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: ENV.CORS_ORIGIN === '*' ? true : [...allowedOrigins, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Swagger UI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API versioning v1
app.use('/api/v1', apiV1Routes);

// Root greeting / redirect
app.get('/', (_req, res) => {
  res.json({
    name: 'KIBO360 Financial Accounting & Publishers ERP API',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/v1/health',
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
