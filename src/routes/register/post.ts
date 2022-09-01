import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import User from "../../models/user.js";
import APIRoute from "../../structures/api_route.js";
import { Errors, Messages } from "../../utils/constants.js";

export default class extends APIRoute {
  async run(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const { name, email, password } = req.body;

    // Check if email exists
    if (User.exists(email)) {
      return res
        .status(400)
        .json({ error: { email: Errors.EMAIL_ALREADY_EXISTS } });
    }

    // Register user
    const result = await User.register(name, email, password);

    // Check if user is successfully registered
    if (!result) return res.sendStatus(500);

    res.status(201).json({ message: Messages.REGISTER_SUCCESS });
  }
}
