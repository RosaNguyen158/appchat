import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "reacts" })
export class React extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("enum", { enum: ["Heart", "Like", "Sad"], default: "Heart" })
  name = "";

  // @Column("simple-enum", { enum: ["A", "B", "C"] })
  // simpleEnum: string

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updatedAt = null;
}
