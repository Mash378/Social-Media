import { RequestHandler } from "express";

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  res.status(401).json({ error: "Unauthenticated" });
};
