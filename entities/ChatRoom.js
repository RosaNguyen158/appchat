import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "chatroom" })
export class ChatRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("text", { nullable: true })
  title = "";

  @Column("enum", { enum: ["direct", "group"], default: "direct" })
  type = "";

  @Column("enum", { enum: ["public", "private"], default: "private" })
  group_types = "private";

  @Column("text", { nullable: true })
  code_gr = "";

  @Column("timestamp with time zone")
  created_at = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updated_at = null;
}
