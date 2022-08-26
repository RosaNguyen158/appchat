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

@Entity({ name: "seenBys" })
export class SeenBy extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => ChatRoom, (chatrooms) => chatrooms.seenBys)
  @JoinColumn()
  roomId = new ChatRoom();

  @ManyToOne(() => Message, (messages) => messages.seenBys)
  @JoinColumn()
  roomId = new Message();

  @ManyToOne(() => User, (users) => users.seenBys)
  @JoinColumn()
  mem_id = new User();

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updatedAt = null;
}
