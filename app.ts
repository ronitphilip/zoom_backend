import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler';
import authRouter from './routes/user.routes';
import roleRouter from './routes/role.routes';
import zoomRouter from './routes/zoom.routes';
import reportRouter from './routes/report.routes';
import teamRouter from './routes/team.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/users', authRouter);
app.use('/roles', roleRouter);
app.use('/zoom', zoomRouter);
app.use('/reports', reportRouter);
app.use('/teams', teamRouter);
app.use(errorHandler);

app.get('/', (_req, res) => {
  res.send('Server is running...');
});

export default app;
