import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from './message.entity';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';

export interface Conversation {
  id: string;
  type: 'GROUP' | 'PRIVATE';
  name: string;
  lastMessage: Message | null;
  unreadCount: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async sendMessage(
    senderId: string,
    content: string,
    receiverId?: string,
    groupId?: string,
  ): Promise<Message> {
    const message = this.messageRepo.create({
      senderId,
      receiverId,
      groupId,
      content,
    });
    return this.messageRepo.save(message);
  }

  async getConversations(userId: string) {
    // 1. Get all groups user is a member of
    const userGroups = await this.groupRepo
      .createQueryBuilder('group')
      .innerJoin('group.members', 'member', 'member.id = :userId', { userId })
      .getMany();

    const groupIds = userGroups.map((g) => g.id);

    // 2. Get latest messages for groups
    const groupLastMessages = groupIds.length > 0 
      ? await this.messageRepo
          .createQueryBuilder('message')
          .where('message.groupId IN (:...groupIds)', { groupIds })
          .orderBy('message.createdAt', 'DESC')
          .getMany()
      : [];

    // 3. Get latest private messages
    const privateMessages = await this.messageRepo
      .createQueryBuilder('message')
      .where('(message.senderId = :senderIdParam AND message.receiverId IS NOT NULL) OR message.receiverId = :receiverIdParam', { senderIdParam: userId, receiverIdParam: userId })
      .leftJoinAndSelect('message.sender', 'sender')
      // Note: We'd ideally want a more complex query to group by conversation partner, 
      // but for now we'll aggregate them in memory for simplicity in this implementation.
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    // 4. Aggregate
    const conversations: Conversation[] = [];

    // Group logic
    for (const group of userGroups) {
      const lastMsg = groupLastMessages.find((m) => m.groupId === group.id);
      conversations.push({
        id: group.id,
        type: 'GROUP',
        name: group.name,
        lastMessage: lastMsg || null,
        unreadCount: 0, // Placeholder
      });
    }

    // Private logic (group by partner)
    const partners = new Set();
    for (const msg of privateMessages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!partners.has(partnerId)) {
        partners.add(partnerId);
        conversations.push({
          id: partnerId,
          type: 'PRIVATE',
          name: msg.senderId === userId ? 'You' : `${msg.sender?.firstName} ${msg.sender?.lastName}`, // Placeholder name logic
          lastMessage: msg,
          unreadCount: 0, // Placeholder
        });
      }
    }

    return {
      data: conversations.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt?.getTime() || 0;
        const timeB = b.lastMessage?.createdAt?.getTime() || 0;
        return timeB - timeA;
      })
    };
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return this.messageRepo
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :u1Sender AND message.receiverId = :u2Receiver) OR (message.senderId = :u2Sender AND message.receiverId = :u1Receiver)',
        { 
          u1Sender: userId1, u1Receiver: userId1,
          u2Sender: userId2, u2Receiver: userId2
        },
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async getGroupMessages(groupId: string, limit = 50, offset = 0): Promise<Message[]> {
    return this.messageRepo.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.messageRepo.update(messageId, { isRead: true });
  }

  async searchUsers(query: string, currentUserId: string, limit = 20): Promise<Partial<User>[]> {
    const qb = this.userRepo.createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.avatarUrl',
        'user.role'
      ])
      .where('user.id != :currentUserId', { currentUserId });

    if (query && query.trim() !== '') {
      qb.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:query) OR ' +
        'LOWER(user.lastName) LIKE LOWER(:query) OR ' +
        'LOWER(user.email) LIKE LOWER(:query))',
        { query: `%${query}%` }
      );
    }

    return qb.limit(limit).getMany();
  }
}
