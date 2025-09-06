import 'dotenv/config';
import path from 'path';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import logger from '@/config/logger';
import routes from '@/routes';

const app = express();
const PORT = process.env.PORT || 5002;
const route = process.env.API_ROUTE || '/api/v1';

app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, '../public')));

app.use(cookieParser());

app.use(route, routes);

app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
	})
);

app.get(route, (req: Request, res: Response) => {
	res.status(StatusCodes.OK).json({ status: 'success', message: 'Backend is running' });
});

app.use((req: Request, res: Response) => {
	const errMsg = `${req.method} ${req.originalUrl}`;
	logger.warn(`${StatusCodes.NOT_FOUND} Not Found: ${errMsg}`);
	res.status(StatusCodes.NOT_FOUND).json({ status: 'error', message: `Resource not found for ${errMsg}` });
});

app.listen(PORT, () => {
	const startMessage = `Server running on port ${PORT}`;
	logger.info(startMessage, { isImportant: true });
});

const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
signals.forEach((signal) => {
	process.on(signal, () => {
		const stopMessage = `Server shutting down due to ${signal}`;
		logger.info(stopMessage);
	});
});
