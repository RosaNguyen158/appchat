import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "friend" })
export class Friend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  @Column("text", { nullable: true })
  user_id = "";

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "friend_id" })
  @Column("text", { nullable: true })
  friend_id = "";

  @Column("text")
  status = "";

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updated_at = null;
}
