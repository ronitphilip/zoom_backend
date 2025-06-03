import dotenv from 'dotenv';
dotenv.config();
import express, { Express } from 'express';
import cors from 'cors';
import initializeSequelize from './config/db';
import authRouter from './route/user.routes';
import errorHandler from './middleware/errorHandler';
import initModels from './model'
const server: Express = express();

server.use(cors());
server.use(express.json());
server.use('/users', authRouter);
server.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.get('/', (_req, res) => {
    res.send('Server is running...');
});

const startServer = async () => {
    try {
        const sequelize = await initializeSequelize();
        await initModels(sequelize);
        await sequelize.sync({ alter: true });
        console.log('Database synced');

        server.listen(PORT, () => {
            console.log(`Server running at PORT: ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();