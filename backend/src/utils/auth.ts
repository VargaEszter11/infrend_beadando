import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const SECRET = "secret123";

type AuthedRequest = Request & { user?: string | JwtPayload };

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;

    if (!auth) return res.status(401).json({ error: "No token" });

    try {
        const token = auth.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Invalid token" });
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}