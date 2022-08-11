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

@Entity({ name: "user_account" })
export class UserAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("boolean")
  is_active = "";

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();

  @OneToOne(() => User, (user) => user.user_account)
  @JoinColumn()
  user_id = new User();
}
