import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const SECRET = "secret123";

// REGISTER
router.post("/register", async (req, res) => {
    const repo = AppDataSource.getRepository(User);

    const { username, password } = req.body;

    const existing = await repo.findOneBy({ username });
    if (existing) return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = repo.create({ username, password: hashed });
    await repo.save(user);

    res.json({ message: "Registered" });
});

// LOGIN
router.post("/login", async (req, res) => {
    const repo = AppDataSource.getRepository(User);

    const { username, password } = req.body;

    const user = await repo.findOneBy({ username });
    if (!user) return res.status(400).json({ error: "Invalid login" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid login" });

    const token = jwt.sign({ id: user.id }, SECRET);

    res.json({ token });
});

export default router;