import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "chatroom" })
export class ChatRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("text")
  type = "";

  @Column("text")
  title = "";

  @Column("text")
  group_types = "";

  @Column("text")
  link_gr = "";

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone")
  updated_at = new Date();
}
