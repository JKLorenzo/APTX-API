import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import User from "../../models/user.js";
import APIRoute from "../../structures/api_route.js";
import { Errors } from "../../utils/constants.js";

export default class extends APIRoute {
  async run(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: { email: Errors.EMAIL_INVALID } });
    }

    if (!password) {
      return res
        .status(400)
        .json({ error: { password: Errors.PASSWORD_INVALID } });
    }

    if (!User.exists(email)) {
      return res.status(400).json({ error: { email: Errors.EMAIL_NOT_EXIST } });
    }

    const token = await User.login(email, password);
    if (!token) {
      return res
        .status(400)
        .json({ error: { password: Errors.PASSWORD_INVALID } });
    }

    return res.status(200).json({ token });
  }
}
