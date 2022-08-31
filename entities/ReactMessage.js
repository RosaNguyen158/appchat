import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Message } from "./Message";
import { React } from "./React";
import { User } from "./User";

@Entity({ name: "reactMessages" })
export class ReactMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => Message, (messages) => messages.id)
  @JoinColumn({ name: "messageId" })
  @Column("text", { nullable: true })
  messageId = "";

  @ManyToOne(() => User, (users) => users.id)
  @JoinColumn({ name: "userId" })
  @Column("text", { nullable: true })
  memberId = "";

  @ManyToOne(() => React, (reacts) => reacts.id)
  @JoinColumn({ name: "reactId" })
  @Column("text", { nullable: true })
  reactId = "";

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updatedAt = null;
}
