import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    status?: number;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // console.error(`[${new Date().toISOString()}] Error: ${message}`, {
    //     statusCode,
    //     stack: err.stack,
    //     path: req.path,
    //     method: req.method
    // });

    res.status(statusCode).json({
        error: {
            message,
            status: statusCode,
            timestamp: new Date().toISOString()
        }
    });
};

export default errorHandler;