import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import User from "../../models/user.js";
import APIRoute from "../../structures/api_route.js";

export default class extends APIRoute {
  middleware(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    const valid = User.verify(token);
    if (!valid) return res.sendStatus(401);

    next();
  }

  async run(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const users = await User.getAll();
    res.json([...users]);
  }
}
