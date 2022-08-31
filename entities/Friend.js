import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "./User";

@Entity({ name: "friends" })
export class Friend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => User, (users) => users.id)
  @JoinColumn({ name: "userId" })
  @Column("text", { nullable: true })
  userId = "";

  @ManyToOne(() => User, (users) => users.id)
  @JoinColumn({ name: "friendId" })
  @Column("text", { nullable: true })
  friendId = "";

  @Column("text")
  status = "";

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updatedAt = null;
}
