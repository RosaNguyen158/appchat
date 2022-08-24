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
import { Message } from "./Message";

@Entity({ name: "seenby" })
export class SeenBy extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.seenby)
  @JoinColumn()
  room_id = new ChatRoom();

  @ManyToOne(() => Message, (message) => message.seenby)
  @JoinColumn()
  room_id = new Message();

  @ManyToOne(() => User, (user) => user.seenby)
  @JoinColumn()
  mem_id = new User();

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updated_at = null;
}
