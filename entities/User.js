import { text } from "stream/consumers";
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity({ name: "user" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("identity")
  id = "";

  @Column("text")
  password = "";

  @Column("text")
  username = "";

  @Column("text")
  email = "";

  @Column("text")
  otp = "";

  @Column("timestamp with time zone")
  created_at = "";

  @Column("timestamp with time zone")
  updated_at = "";
}

// module.exports = {
//     Category: Category
// };
