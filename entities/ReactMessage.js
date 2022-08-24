import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Message } from "./Message";
import { React } from "./React";
import { User } from "./User";

@Entity({ name: "react_message" })
export class ReactMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => Message, (message) => message.id)
  @JoinColumn({ name: "message_id" })
  @Column("text", { nullable: true })
  message_id = "";

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  @Column("text", { nullable: true })
  member_id = "";

  @ManyToOne(() => React, (react) => react.id)
  @JoinColumn({ name: "react_id" })
  @Column("text", { nullable: true })
  react_id = "";

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updated_at = null;
}
