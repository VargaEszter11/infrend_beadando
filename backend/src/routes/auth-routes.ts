import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const SECRET = "secret123";

function parseCredentials(body: unknown): { username: string; password: string } | null {
    if (!body || typeof body !== "object") return null;
    const { username, password } = body as { username?: unknown; password?: unknown };
    const u = typeof username === "string" ? username.trim() : "";
    const p = typeof password === "string" ? password : "";
    if (!u || p.length === 0) return null;
    return { username: u, password: p };
}

// REGISTER
router.post("/register", async (req, res) => {
    const parsed = parseCredentials(req.body);
    if (!parsed) return res.status(400).json({ error: "Username and password are required" });

    const repo = AppDataSource.getRepository(User);

    const { username, password } = parsed;

    const existing = await repo.findOneBy({ username });
    if (existing) return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = repo.create({ username, password: hashed });
    await repo.save(user);

    res.json({ message: "Registered" });
});

// LOGIN
router.post("/login", async (req, res) => {
    const parsed = parseCredentials(req.body);
    if (!parsed) return res.status(400).json({ error: "Username and password are required" });

    const repo = AppDataSource.getRepository(User);

    const { username, password } = parsed;

    const user = await repo.findOneBy({ username });
    if (!user) return res.status(400).json({ error: "Invalid login" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid login" });

    const token = jwt.sign({ id: user.id }, SECRET);

    res.json({ token });
});

export default router;