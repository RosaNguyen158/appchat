import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { makeid } from "../helpers/generateKey";
@Entity({ name: "users" })
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
  firstName = "";

  @Column("text", { nullable: true })
  lastName = "";

  @Column("text", { nullable: true })
  avartarImg = "";

  @Column("text")
  secretKey = makeid(4);

  @Column("text")
  refreshSecretKey = makeid(4);

  @Column("text", { nullable: true })
  tempToken = "";

  @Column("text", { nullable: true })
  otpEmail = "";

  @Column("text", { nullable: true })
  secret2FA = "";

  @Column("text", { nullable: true })
  recovery = "";

  @Column("boolean")
  isActive = false;

  @Column("timestamp with time zone", { nullable: true })
  lastSeen = null;

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone")
  updatedAt = new Date();
}

// module.exports = {
//     Category: Category
// };
