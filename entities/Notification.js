import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "notification" })
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  @Column("int")
  user_id = 0;

  @Column("boolean", { nullable: true })
  is_read = false;

  @Column("text", { nullable: true })
  content = 0;

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
