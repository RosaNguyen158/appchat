import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { ChatRoom } from "./ChatRoom";

@Entity({ name: "member" })
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("boolean", { default: false })
  is_admin = "";

  @Column("boolean", { default: false })
  is_mute = "";

  @ManyToOne(() => User, (user) => user.member)
  @JoinColumn()
  mem_id = new User();

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.member)
  @JoinColumn()
  room_id = new ChatRoom();

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
