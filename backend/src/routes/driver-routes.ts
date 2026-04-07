import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Driver } from "../entity/driver";
import { authMiddleware } from "../utils/auth";

const router = Router();

router.get("/", async (_, res) => {
    const drivers = await AppDataSource.getRepository(Driver).find();

    const result = drivers.map(d => ({
        ...d,
        isExpired: new Date(d.licenseExpiry) < new Date()
    }));

    res.json(result);
});

router.post("/", authMiddleware, async (req, res) => {
    const repo = AppDataSource.getRepository(Driver);
    const driver = repo.create(req.body);
    await repo.save(driver);
    res.json(driver);
});

router.put("/:id", authMiddleware, async (req, res, next) => {
    try {
        const repo = AppDataSource.getRepository(Driver);

        const driver = await repo.findOneBy({ id: Number(req.params.id) });

        if (!driver) {
            return res.status(404).json({ error: "Driver not found" });
        }

        Object.assign(driver, req.body);

        await repo.save(driver);

        res.json(driver);
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
    try {
        const repo = AppDataSource.getRepository(Driver);

        const driver = await repo.findOneBy({ id: Number(req.params.id) });

        if (!driver) {
            return res.status(404).json({ error: "Driver not found" });
        }

        await repo.remove(driver);

        res.json({ message: "Deleted" });
    } catch (e) {
        next(e);
    }
});

export default router;
