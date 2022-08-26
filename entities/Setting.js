import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "settings" })
export class Setting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @OneToOne(() => User, (users) => users.id)
  @JoinColumn({ name: "userId" })
  @Column("int")
  userId = 0;

  @Column("enum", {
    enum: ["Everybody", "My contacts", "Nobody"],
    default: "Everybody",
  })
  rolePhoneSeenby = "Everybody";

  @Column("enum", {
    enum: ["Everybody", "My contacts", "Nobody"],
    default: "Everybody",
  })
  roleLastseen = "Everybody";

  @Column("enum", {
    enum: ["Everybody", "My contacts"],
    default: "Everybody",
  })
  roleAddToGroup = "Everybody";

  @Column("enum", {
    enum: ["Everybody", "My contacts", "Nobody"],
    default: "Everybody",
  })
  linkInFwd = "Everybody";

  @Column("boolean", { default: false })
  activeInGroup = false;

  @Column("boolean", { default: false })
  twoStepVerification = false;

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updatedAt = null;
}
