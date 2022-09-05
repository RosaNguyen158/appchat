import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'

import { ChatRoom } from './ChatRoom'
import { Message } from './Message'
import { User } from './User'

@Entity({ name: 'seenBys' })
export class SeenBy extends BaseEntity {
    @PrimaryGeneratedColumn()
    id = new Number()

    @ManyToOne(() => ChatRoom, (chatrooms) => chatrooms.seenBys)
    @JoinColumn()
    roomId = new ChatRoom()

    @ManyToOne(() => Message, (messages) => messages.seenBys)
    @JoinColumn()
    messagesId = new Message()

    @ManyToOne(() => User, (users) => users.seenBys)
    @JoinColumn()
    mem_id = new User()

    @Column('timestamp with time zone')
    createdAt = new Date()

    @Column('timestamp with time zone', { nullable: true })
    updatedAt = null
}
