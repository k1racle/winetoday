import { Request, Response, NextFunction } from 'express';
export declare function createMediaAvifMiddleware(uploadsDir: string): (req: Request, res: Response, next: NextFunction) => Promise<void>;
