import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "react" })
export class React extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("text")
  name = "";

  @Column("text")
  message = "";

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
