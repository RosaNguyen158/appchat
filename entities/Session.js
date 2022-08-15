import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "session" })
export class Session extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("text", { nullable: true })
  device_name = null;

  @Column("text", { nullable: true })
  app_version = null;

  @Column("text", { nullable: true })
  location = null;

  @Column("text", { nullable: true })
  ip_address = null;

  @Column("text")
  token = "";

  @Column("text")
  refresh_token = "";

  @Column("timestamp with time zone")
  last_active = new Date();

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn("numberic", { nullable: true })
  user_id = null;

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
