import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "chatrooms" })
export class ChatRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = new Number();

  @Column("text", { nullable: true })
  title = "";

  @Column("enum", { enum: ["direct", "group"], default: "direct" })
  type = "";

  @Column("enum", { enum: ["public", "private"], default: "private" })
  groupTypes = "private";

  @Column("text", { nullable: true })
  codeGroup = "";

  @Column("timestamp with time zone")
  createdAt = new Date();

  @Column("timestamp with time zone", { nullable: true })
  updatedAt = null;
}
