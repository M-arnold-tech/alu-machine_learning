import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { AdvisorProfile } from '../users/advisor-profile.entity';
import { FarmerProfile } from '../users/farmer-profile.entity';
import { UserRole } from '../common/decorators/roles.decorator';

@Injectable()
export class AdvisorService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(AdvisorProfile)
    private advisorProfileRepo: Repository<AdvisorProfile>,
    @InjectRepository(FarmerProfile)
    private farmerProfileRepo: Repository<FarmerProfile>,
  ) {}

  async getAssignedFarmers(advisorId: string) {
    const farmers = await this.farmerProfileRepo.find({
      where: { assignedAdvisorId: advisorId },
      relations: ['user'],
    });
    return { data: farmers };
  }

  async assignFarmer(advisorId: string, farmerId: string) {
    const farmer = await this.farmerProfileRepo.findOne({
      where: { userId: farmerId },
    });
    if (!farmer) throw new NotFoundException('Farmer not found');
    farmer.assignedAdvisorId = advisorId;
    await this.farmerProfileRepo.save(farmer);
    return { message: 'Farmer assigned successfully' };
  }

  async updateProfile(userId: string, dto: Partial<AdvisorProfile>) {
    const profile = await this.advisorProfileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Advisor profile not found');
    Object.assign(profile, dto);
    const updated = await this.advisorProfileRepo.save(profile);
    return { message: 'Profile updated', data: updated };
  }

  async getAdvisorStats(advisorId: string) {
    const assignedFarmers = await this.farmerProfileRepo.count({
      where: { assignedAdvisorId: advisorId },
    });
    return { data: { assignedFarmers } };
  }
}
