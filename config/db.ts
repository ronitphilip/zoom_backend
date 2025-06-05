import { Client } from 'pg';
import { Sequelize } from 'sequelize';
import { parse } from 'url';

const initializeSequelize = async () => {
    let dbConfig: {
        database: string;
        username: string;
        password: string;
        host: string;
        port: number;
    };

    if (process.env.DATABASE_URL) {
        const parsedUrl = parse(process.env.DATABASE_URL);
        const [username, password] = (parsedUrl.auth || '').split(':');
        dbConfig = {
            database: parsedUrl.pathname?.slice(1) || '',
            username: username || '',
            password: password || '',
            host: parsedUrl.hostname || 'localhost',
            port: parseInt(parsedUrl.port || '5432', 10),
        };
    } else {
        const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Missing environment variable: ${envVar}`);
            }
        }
        dbConfig = {
            database: process.env.DB_NAME!,
            username: process.env.DB_USER!,
            password: process.env.DB_PASSWORD!,
            host: process.env.DB_HOST!,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        };
    }

    if (process.env.NODE_ENV !== 'test') {
        await DatabaseExists(dbConfig);
    }

    const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'postgres',
        logging: false,
    });

    await sequelize.authenticate();
    console.log('Database connection established successfully');
    return sequelize;
};

const DatabaseExists = async (dbConfig: {
    database: string;
    username: string;
    password: string;
    host: string;
    port: number;
}) => {
    const client = new Client({
        user: dbConfig.username,
        host: dbConfig.host,
        password: dbConfig.password,
        port: dbConfig.port,
        database: 'postgres',
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [
            dbConfig.database,
        ]);
        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE "${dbConfig.database}";`);
            console.log(`Database ${dbConfig.database} created successfully`);
        } else {
            console.log(`Database ${dbConfig.database} already exists`);
        }
    } catch (err) {
        console.error('Error ensuring database exists:', err);
        throw err;
    } finally {
        await client.end();
    }
};

export default initializeSequelize;