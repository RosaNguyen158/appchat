import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { UserAccount } from "./UserAccount";
import { ChatRoom } from "./ChatRoom";

@Entity({ name: "member" })
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("boolean")
  is_admin = "";

  @Column("text")
  app_version = "";

  @Column("boolean")
  is_mute = "";

  @ManyToOne(() => UserAccount, (user_account) => user_account.friend)
  @JoinColumn()
  mem_id = new UserAccount();

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.member)
  @JoinColumn()
  room_id = new ChatRoom();

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
