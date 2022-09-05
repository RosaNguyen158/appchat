import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export class UserAccount_old {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();

  @OneToOne(() => User, (user) => user.user_account)
  @JoinColumn()
  user_id = new User();
}
