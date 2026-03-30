import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../users/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groupRepo: Repository<Group>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(adminId: string, dto: { name: string; description?: string; district?: string }) {
    const user = await this.userRepo.findOne({ where: { id: adminId } });
    if (!user) throw new NotFoundException('Creator user not found');

    const group = this.groupRepo.create({ ...dto, adminId, members: [user] });
    const savedGroup = await this.groupRepo.save(group);
    
    return { 
      data: {
        ...savedGroup,
        memberCount: 1,
        isMember: true
      } 
    };
  }

  async findAll(currentUserId?: string, district?: string) {
    const where = district ? { district } : {};
    const groups = await this.groupRepo.find({ 
      where, 
      relations: ['members'] 
    });

    const data = groups.map(group => ({
      ...group,
      memberCount: group.members?.length || 0,
      isMember: currentUserId ? group.members?.some(m => m.id === currentUserId) : false,
      members: undefined // Don't return full member list in the 'all' view for performance
    }));

    return { data };
  }

  async findOne(id: string, currentUserId?: string) {
    const group = await this.groupRepo.findOne({ 
      where: { id }, 
      relations: ['members', 'admin'] 
    });
    
    if (!group) throw new NotFoundException('Group not found');
    
    return { 
      data: {
        ...group,
        memberCount: group.members?.length || 0,
        isMember: currentUserId ? group.members?.some(m => m.id === currentUserId) : false
      } 
    };
  }

  async join(groupId: string, userId: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId }, relations: ['members'] });
    if (!group) throw new NotFoundException('Group not found');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!group.members) group.members = [];
    const alreadyMember = group.members.some((m) => m.id === userId);
    if (!alreadyMember) {
      group.members.push(user);
      await this.groupRepo.save(group);
    }
    return { message: 'Joined group successfully' };
  }

  async leave(groupId: string, userId: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId }, relations: ['members'] });
    if (!group) throw new NotFoundException('Group not found');
    group.members = (group.members || []).filter((m) => m.id !== userId);
    await this.groupRepo.save(group);
    return { message: 'Left group successfully' };
  }
}
