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

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  @Column("int")
  user_id = 0;

  @Column("enum", {
    enum: ["Everybody", "My contacts", "Nobody"],
    default: "Everybody",
  })
  role_phone_seenby = "Everybody";

  @Column("enum", {
    enum: ["Everybody", "My contacts", "Nobody"],
    default: "Everybody",
  })
  role_lastseen = "Everybody";

  @Column("enum", {
    enum: ["Everybody", "My contacts"],
    default: "Everybody",
  })
  role_add_to_group = "Everybody";

  @Column("enum", {
    enum: ["Everybody", "My contacts", "Nobody"],
    default: "Everybody",
  })
  link_in_fwd = "Everybody";

  @Column("boolean", { default: false })
  active_in_group = false;

  @Column("boolean", { default: false })
  two_step_verification = false;

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updated_at = null;
}
