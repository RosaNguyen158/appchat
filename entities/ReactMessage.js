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
import { UserAccount } from "./UserAccount";

@Entity({ name: "react_message" })
export class ReactMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => Message, (message) => message.react_message)
  @JoinColumn()
  message_id = new Message();

  @ManyToOne(() => React, (react) => react.react_message)
  @JoinColumn()
  room_id = new React();

  @ManyToOne(() => UserAccount, (user_account) => user_account.react_message)
  @JoinColumn()
  room_id = new UserAccount();

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
