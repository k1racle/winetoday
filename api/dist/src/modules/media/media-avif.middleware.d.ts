import { Request, Response, NextFunction } from 'express';
export declare function createMediaAvifMiddleware(uploadsDirs: string[]): (req: Request, res: Response, next: NextFunction) => Promise<void>;
