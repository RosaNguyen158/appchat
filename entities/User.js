import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  EntitySchema,
} from "typeorm";

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

  @Column("text")
  first_name = "";

  @Column("text")
  last_name = "";

  @Column("text")
  avartar_img = "";

  @Column("text")
  secret_key = "";

  @Column("text")
  otp = "";

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}

// module.exports = {
//     Category: Category
// };
