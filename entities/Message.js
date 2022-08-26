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

@Entity({ name: "messages" })
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => User, (users) => users.id)
  @JoinColumn({ name: "senderId" })
  @Column("int", { nullable: true })
  senderId = null;

  @ManyToOne(() => ChatRoom, (chatrooms) => chatrooms.id)
  @JoinColumn({ name: "roomId" })
  @Column("int", { nullable: true })
  roomId = null;

  @Column("text", { nullable: true })
  status = "";

  @Column("text")
  message = "";

  @Column("int", { nullable: true })
  replyId = 0;

  @Column("int", { nullable: true })
  forwardId = 0;

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updatedAt = null;
}
