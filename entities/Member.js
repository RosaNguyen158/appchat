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
  is_admin = false;

  @Column("boolean", { default: false })
  is_mute = false;

  // @ManyToOne(() => User, (user) => user.member)
  // @JoinColumn()
  // mem_id = new User();

  @ManyToOne(() => User, (user) => user.id)
  @Column("int", { nullable: true })
  user_id = null;

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.id)
  @Column("int", { nullable: true })
  room_id = null;

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
