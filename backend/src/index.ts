import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";

import { AppDataSource } from "./data-source";

import carRoutes from "./routes/car-routes";
import driverRoutes from "./routes/driver-routes";
import tripRoutes from "./routes/trip-routes";
import reportRoutes from "./routes/report-routes";
import { AppError } from "./utils/errors";
import authRoutes from "./routes/auth-routes";

const app = express();

app.use(cors());
app.use(express.json());

AppDataSource.initialize().then(() => {
    console.log("DB connected");

    app.use("/cars", carRoutes);
    app.use("/drivers", driverRoutes);
    app.use("/trips", tripRoutes);
    app.use("/report", reportRoutes);
    app.use("/auth", authRoutes);

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof AppError) {
            res.status(err.status).json({ error: err.message });
            return;
        }
        const status =
            err &&
                typeof err === "object" &&
                "status" in err &&
                typeof (err as { status: unknown }).status === "number"
                ? (err as { status: number }).status
                : 500;
        const message = err instanceof Error ? err.message : "Internal Server Error";
        res.status(status).json({ error: message });
    });

    app.listen(3000, () => console.log("Server running on 3000"));
});
