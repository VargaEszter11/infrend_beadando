import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Trip } from "../entity/trip";
import { Driver } from "../entity/driver";
import { Car } from "../entity/car";
import { AppError } from "../utils/errors";
import { authMiddleware } from "../utils/auth";

const router = Router();

router.get("/", async (_, res) => {
    const trips = await AppDataSource.getRepository(Trip).find({
        relations: ["car", "driver"],
    });
    res.json(trips);
});

router.post("/", authMiddleware, async (req, res, next) => {
    try {
        const repo = AppDataSource.getRepository(Trip);
        const driverRepo = AppDataSource.getRepository(Driver);
        const carRepo = AppDataSource.getRepository(Car);

        const { carId, driverId, createReturnTrip, ...data } = req.body as Record<
            string,
            unknown
        > & {
            carId?: number;
            driverId?: number;
            createReturnTrip?: boolean;
        };

        if (carId === undefined || driverId === undefined) {
            throw new AppError("carId and driverId are required");
        }

        const driver = await driverRepo.findOneBy({ id: Number(driverId) });
        const car = await carRepo.findOneBy({ id: Number(carId) });

        if (!driver || !car) throw new AppError("Invalid car or driver");

        if (new Date(driver.licenseExpiry) < new Date()) {
            throw new AppError("Driver license expired");
        }

        const trip = repo.create({
            ...data,
            driver,
            car,
        } as Parameters<typeof repo.create>[0]);

        await repo.save(trip);

        if (createReturnTrip) {
            const endKm = Number(data.endKm);
            const distance = Number(data.distance);

            if (isNaN(distance) || isNaN(endKm)) {
                throw new AppError("Invalid numeric values");
            }

            const returnTrip = repo.create({
                ...data,
                driver,
                car,
                from: data.to as string,
                to: data.from as string,
                endKm: endKm + distance,
            } as Parameters<typeof repo.create>[0]);

            await repo.save(returnTrip);
        }

        res.json(trip);
    } catch (e) {
        next(e);
    }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
    try {
        const repo = AppDataSource.getRepository(Trip);

        const trip = await repo.findOneBy({ id: Number(req.params.id) });
        if (!trip) throw new AppError("Trip not found", 404);

        Object.assign(trip, req.body);

        await repo.save(trip);

        res.json(trip);
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
    try {
        const repo = AppDataSource.getRepository(Trip);

        const trip = await repo.findOneBy({ id: Number(req.params.id) });
        if (!trip) throw new AppError("Trip not found", 404);

        await repo.remove(trip);

        res.json({ message: "Deleted" });
    } catch (e) {
        next(e);
    }
});

export default router;
