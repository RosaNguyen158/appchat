import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { UserAccount } from "./UserAccount";
import { ChatRoom } from "./ChatRoom";
import { User } from "./User";

@Entity({ name: "message" })
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => UserAccount, (user_account) => user_account.friend)
  @JoinColumn()
  sender_id = new UserAccount();

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.member)
  @JoinColumn()
  room_id = new ChatRoom();

  @Column("text")
  status = "";

  @Column("text")
  message = "";

  @Column("int")
  reply_id = 0;

  @Column("int")
  forward_id = 0;

  @OneToMany(() => UserAccount, (user_account) => user_account.message)
  @Column("int")
  seenby = new UserAccount();

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
