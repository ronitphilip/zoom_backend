import express from 'express';
import cors from 'cors';
import authRouter from './route/user.routes';
import errorHandler from './middleware/errorHandler';
import roleRouter from './route/role.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/users', authRouter);
app.use('/roles', roleRouter);
app.use(errorHandler);

app.get('/', (_req, res) => {
  res.send('Server is running...');
});

export default app;
