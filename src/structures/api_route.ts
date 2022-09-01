import type { Request, Response, NextFunction } from "express";

export default abstract class APIRoute {
  // Accept request (default)
  middleware(req: Request, res: Response, next: NextFunction) {
    next();
  }

  // Internal Server Error (default)
  run(req: Request, res: Response) {
    res.sendStatus(500);
  }
}
