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

@Entity({ name: "sessions" })
export class Session extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne((userId) => User, (users) => users.id)
  @JoinColumn({ name: "userId" })
  @Column("int")
  userId = 0;

  @Column("text", { nullable: true })
  deviceName = null;

  @Column("text", { nullable: true })
  agentOs = null;

  @Column("text", { nullable: true })
  agentBrowser = null;

  @Column("text", { nullable: true })
  appVersion = null;

  @Column("text", { nullable: true })
  location = null;

  @Column("text", { nullable: true })
  ipAddress = null;

  @Column("text", { nullable: true })
  token = "";

  @Column("text", { nullable: true })
  refreshToken = "";

  @Column("timestamp with time zone", { nullable: true })
  lastActive = null;

  // @JoinColumn("numberic", { nullable: true })
  // userId = null;
  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updatedAt = null;
}
