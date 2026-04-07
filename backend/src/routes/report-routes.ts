import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Trip } from "../entity/trip";

const router = Router();

router.get("/", async (req, res) => {
    const { carId, month, year } = req.query as {
        carId?: string;
        month?: string;
        year?: string;
    };

    const trips = await AppDataSource.getRepository(Trip).find({
        where: { car: { id: Number(carId) } },
        relations: ["car"],
    });

    const y = Number(year);
    const m = Number(month);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);

    const filtered = trips.filter(
        (t) => new Date(t.date) >= start && new Date(t.date) <= end,
    );

    const fuelPrice = 480;
    const costPerKm = 10;

    const calc = (list: Trip[]) => {
        let distance = 0;
        let fuel = 0;
        let flat = 0;

        for (const t of list) {
            distance += t.distance;
            const f = (t.distance / 100) * t.car.consumption;
            fuel += f * fuelPrice;
            flat += t.distance * costPerKm;
        }

        return { distance, fuel, flat, total: fuel + flat };
    };

    res.json({
        business: calc(filtered.filter((t) => t.type === "BUSINESS")),
        private: calc(filtered.filter((t) => t.type === "PRIVATE")),
    });
});

export default router;
