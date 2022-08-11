import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { UserAccount } from "./UserAccount";

@Entity({ name: "friend" })
export class Friend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => UserAccount, (user_account) => user_account.friend)
  @JoinColumn()
  user_id = new UserAccount();

  @ManyToOne(() => UserAccount, (friend_account) => friend_account.friend)
  @JoinColumn()
  friend_id = new UserAccount();

  @Column("text")
  status = "";

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
