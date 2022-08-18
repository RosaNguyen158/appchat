import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ChatRoom } from "./ChatRoom";
import { User } from "./User";

@Entity({ name: "message" })
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  // @ManyToOne(() => User, (user) => user.message)
  // @JoinColumn()
  // sender_id = new User();

  @ManyToOne(() => User, (user) => user.id)
  @Column("int", { nullable: true })
  sender_id = null;

  // @ManyToOne(() => ChatRoom, (chatroom) => chatroom.message)
  // @JoinColumn()
  // room_id = new ChatRoom();

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.id)
  @Column("int", { nullable: true })
  room_id = null;

  @Column("text", { nullable: true })
  status = "";

  @Column("text")
  message = "";

  @Column("int", { nullable: true })
  reply_id = 0;

  @Column("int", { nullable: true })
  forward_id = 0;

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
