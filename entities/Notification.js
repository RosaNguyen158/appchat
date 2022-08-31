import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "./User";

@Entity({ name: "notifications" })
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @ManyToOne(() => User, (users) => users.id)
  @JoinColumn({ name: "userId" })
  @Column("int")
  userId = 0;

  @Column("boolean", { nullable: true })
  is_read = false;

  @Column("text", { nullable: true })
  content = 0;

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone")
  updatedAt = new Date();
}
