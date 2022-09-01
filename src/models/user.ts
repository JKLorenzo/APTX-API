import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../modules/database.js";
import { JWTSecret } from "../utils/constants.js";
import { IAccessTokenDB, IUserDB, IUserUpdate } from "../utils/interfaces.js";

export default class User {
  id: number;
  name: string;
  email: string;
  password: string;

  constructor(id: number, name: string, email: string, password: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static exists(email: string) {
    const result = db.prepare("SELECT * FROM USERS WHERE email = ?").get(email);

    return typeof result != "undefined";
  }

  static verify(token: string) {
    const _token = db
      .prepare("SELECT * FROM ACCESS_TOKENS WHERE token = ?")
      .get(token);

    return typeof _token != "undefined";
  }

  static async register(name: string, email: string, password: string) {
    const query = db.prepare(
      "INSERT INTO USERS (name, email, password) VALUES (?, ?, ?)"
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = query.run(name, email, hashedPassword);

    return result.changes == 1;
  }

  static async login(email: string, password: string) {
    const user = db
      .prepare("SELECT id, password FROM USERS WHERE email = ?")
      .get(email) as IUserDB | undefined;
    if (!user?.password) return "";

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return "";

    // Generate token
    const token = jwt.sign({ id: user.id }, JWTSecret);

    // Add token to database
    const query = db.prepare(
      "INSERT INTO ACCESS_TOKENS (user_id, token) VALUES (?, ?)"
    );

    const result = query.run(user.id, token);
    if (result.changes == 0) return "";

    return token;
  }

  static async logout(token: string) {
    const query = db.prepare("DELETE FROM ACCESS_TOKENS WHERE token = ?");
    const result = query.run(token);

    return result.changes > 0;
  }

  static async get(id: number) {
    return db.prepare("SELECT id, name, email FROM USERS WHERE id = ?").get(id);
  }

  static async getAll() {
    return db.prepare("SELECT id, name, email FROM USERS").all();
  }

  static async update(id: number, data: IUserUpdate) {
    if ("name" in data) {
      const query = db.prepare("UPDATE USERS SET name = ? WHERE id = ?");
      query.run(data.name, id);
    }

    if ("email" in data) {
      const query = db.prepare("UPDATE USERS SET email = ? WHERE id = ?");
      query.run(data.email, id);
    }

    if ("password" in data) {
      const hashedPassword = await bcrypt.hash(data.password!, 10);

      const query = db.prepare("UPDATE USERS SET password = ? WHERE id = ?");
      query.run(hashedPassword, id);
    }

    return await this.get(id);
  }

  static delete(id: number) {
    const result = db.prepare("DELETE FROM USERS WHERE id = ?").run(id);

    return result.changes > 0;
  }
}
