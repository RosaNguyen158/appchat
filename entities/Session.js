import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  RelationId,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "session" })
export class Session extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("text", { nullable: true })
  device_name = null;

  @Column("text", { nullable: true })
  agent_os = null;

  @Column("text", { nullable: true })
  agent_browser = null;

  @Column("text", { nullable: true })
  app_version = null;

  @Column("text", { nullable: true })
  location = null;

  @Column("text", { nullable: true })
  ip_address = null;

  @Column("text")
  token = "";

  @Column("text", { nullable: true })
  refresh_token = "";

  @Column("timestamp with time zone")
  last_active = new Date();

  @ManyToOne((user_id) => User, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  @Column("int", { nullable: true })
  user_id = null;

  // @JoinColumn("numberic", { nullable: true })
  // userId = null;
  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
