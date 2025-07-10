import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";

export const DashboardController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log('DashboardController');
    
    try {
        const user = req.user;
        const { from, to } = req.body;

        if (!user) {
            return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
        }

        if (!from || !to) {
            return next(Object.assign(new Error('Date missing'), { status: 404 }));
        }
        
    } catch (err) {
        next(err);
    }
}