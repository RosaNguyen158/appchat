import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { UserAccount } from "./UserAccount";

@Entity({ name: "session" })
export class Session extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("text")
  device_name = "";

  @Column("text")
  app_version = "";

  @Column("text")
  location = "";

  @Column("text")
  ip_address = "";

  @Column("text")
  token = "";

  @Column("timestamp with time zone")
  last_active = new Date();

  @ManyToOne(() => UserAccount, (user_account) => user_account.friend)
  @JoinColumn()
  user_id = new UserAccount();

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
