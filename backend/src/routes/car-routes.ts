import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Car } from "../entity/car";
import { authMiddleware } from "../utils/auth";

const router = Router();

router.get("/", async (_, res) => {
    res.json(await AppDataSource.getRepository(Car).find());
});

router.post("/", authMiddleware, async (req, res, next) => {
    try {
        const repo = AppDataSource.getRepository(Car);

        const { licensePlate, consumption, startKm } = req.body;

        if (!licensePlate) {
            return res.status(400).json({ error: "License plate required" });
        }

        if (consumption <= 0 || startKm < 0) {
            return res.status(400).json({ error: "Invalid numeric values" });
        }

        const car = repo.create(req.body);

        await repo.save(car);

        res.json(car);
    } catch (e) {
        next(e);
    }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
    try {
        const repo = AppDataSource.getRepository(Car);

        const car = await repo.findOneBy({ id: Number(req.params.id) });

        if (!car) {
            return res.status(404).json({ error: "Car not found" });
        }

        Object.assign(car, req.body);

        await repo.save(car);

        res.json(car);
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
    try {
        const repo = AppDataSource.getRepository(Car);

        const car = await repo.findOneBy({ id: Number(req.params.id) });

        if (!car) {
            return res.status(404).json({ error: "Car not found" });
        }

        await repo.remove(car);

        res.json({ message: "Deleted" });
    } catch (e) {
        next(e);
    }
});

export default router;
