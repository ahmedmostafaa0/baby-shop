import type { IUser } from "./user";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}