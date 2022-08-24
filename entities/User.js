import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  EntitySchema,
} from "typeorm";
import { makeid } from "../helpers/generateKey";
@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("text")
  password = "";

  @Column("text")
  username = "";

  @Column("text")
  email = "";

  @Column("text", { nullable: true })
  first_name = "";

  @Column("text", { nullable: true })
  last_name = "";

  @Column("text", { nullable: true })
  avartar_img = "";

  @Column("text")
  secret_key = makeid(4);

  @Column("text")
  refresh_secret_key = makeid(4);

  @Column("text", { nullable: true })
  temp_token = "";

  @Column("text", { nullable: true })
  secret_2FA = "";

  @Column("text", { nullable: true })
  recovery = "";

  @Column("boolean")
  is_active = false;

  @Column("timestamp with time zone", { nullable: true })
  last_seen = null;

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}

// module.exports = {
//     Category: Category
// };
