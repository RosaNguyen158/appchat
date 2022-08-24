import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "react" })
export class React extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("enum", { enum: ["Heart", "Like", "Sad"], default: "Heart" })
  name = "";

  // @Column("simple-enum", { enum: ["A", "B", "C"] })
  // simpleEnum: string

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updated_at = null;
}
