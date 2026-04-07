import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Driver {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    birthDate!: Date;

    @Column()
    address!: string;

    @Column()
    licenseNumber!: string;

    @Column()
    licenseExpiry!: Date;
}