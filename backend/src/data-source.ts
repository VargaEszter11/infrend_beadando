import "reflect-metadata";
import { DataSource } from "typeorm";
import { Car } from "./entity/car";
import { Driver } from "./entity/driver";
import { Trip } from "./entity/trip";
import { User } from "./entity/user";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "db.sqlite",
    synchronize: true,
    entities: [Car, Driver, Trip, User],
});
