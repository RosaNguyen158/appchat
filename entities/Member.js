import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { ChatRoom } from "./ChatRoom";
import { User } from "./User";

@Entity({ name: "members" })
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("boolean", { default: false })
  isAdmin = false;

  @Column("boolean", { default: false })
  isMute = false;

  @Column("boolean", { default: false })
  activeInGroup = false;

  @ManyToOne(() => User, (users) => users.id)
  @JoinColumn({ name: "userId" })
  @Column("int", { nullable: true })
  userId = null;

  @ManyToOne(() => ChatRoom, (chatrooms) => chatrooms.id)
  @JoinColumn({ name: "roomId" })
  @Column("int", { nullable: true })
  roomId = null;

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updatedAt = null;
}
