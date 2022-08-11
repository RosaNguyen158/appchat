import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { UserAccount } from "./UserAccount";

@Entity({ name: "setting" })
export class Setting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("text")
  role_phone_seenby = "";

  @Column("text")
  role_lastseen = "";

  @Column("text")
  role_add_to_group = "";

  @Column("text")
  link_in_fwd = "";

  @OneToOne(() => UserAccount, (user_account) => user_account.setting)
  @JoinColumn()
  user_id = new UserAccount();

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
