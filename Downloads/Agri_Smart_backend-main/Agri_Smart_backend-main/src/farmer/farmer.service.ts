import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { FarmerProfile } from '../users/farmer-profile.entity';
import { UserRole } from '../common/decorators/roles.decorator';

@Injectable()
export class FarmerService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(FarmerProfile)
    private farmerProfileRepo: Repository<FarmerProfile>,
  ) {}

  async getMyStats(userId: string) {
    const profile = await this.farmerProfileRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException('Farmer profile not found');

    return {
      data: {
        profile,
        crops: profile.crops || [],
        landSizeHectares: profile.landSizeHectares,
        district: profile.district,
        assignedAdvisorId: profile.assignedAdvisorId,
      },
    };
  }

  async getMyAdvisor(userId: string) {
    const profile = await this.farmerProfileRepo.findOne({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Farmer profile not found');
    if (!profile.assignedAdvisorId) {
      return { data: null, message: 'No advisor assigned yet' };
    }

    const advisor = await this.usersRepo.findOne({
      where: { id: profile.assignedAdvisorId, role: UserRole.ADVISOR },
      select: ['id', 'email', 'firstName', 'lastName', 'phone'],
    });

    return { data: advisor };
  }

  async updateProfile(userId: string, dto: Partial<FarmerProfile>) {
    const profile = await this.farmerProfileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Farmer profile not found');

    Object.assign(profile, dto);
    const updated = await this.farmerProfileRepo.save(profile);
    return { message: 'Profile updated successfully', data: updated };
  }

  async getAllFarmers() {
    const farmers = await this.farmerProfileRepo.find({ relations: ['user'] });
    return { data: farmers };
  }

  async getDirectory(currentUserId: string) {
    const users = await this.usersRepo.find({
      where: [
        { role: UserRole.FARMER, isActive: true },
        { role: UserRole.ADVISOR, isActive: true }
      ],
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'avatarUrl', 'preferredLanguage']
    });

    // Remove the current user from the directory
    const directory = users.filter((u) => u.id !== currentUserId);
    return { data: directory };
  }
}
