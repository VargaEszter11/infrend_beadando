import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Car } from "./car";
import { Driver } from "./driver";

@Entity()
export class Trip {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    date!: Date;

    @Column("float")
    distance!: number;

    @Column()
    type!: string;

    @Column()
    from!: string;

    @Column()
    to!: string;

    @Column()
    endKm!: number;

    @ManyToOne(() => Car, { nullable: false })
    car!: Car;

    @ManyToOne(() => Driver, { nullable: false })
    driver!: Driver;
}
