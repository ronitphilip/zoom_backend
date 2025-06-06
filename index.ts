import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import initializeSequelize from './config/db';
import initModels from './models';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const sequelize = await initializeSequelize();
    await initModels(sequelize);
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    app.listen(PORT, () => {
      console.log(`Server running at PORT: ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();