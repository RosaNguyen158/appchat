import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { User } from "./User";

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

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  @Column("text")
  user_id = new User();

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
