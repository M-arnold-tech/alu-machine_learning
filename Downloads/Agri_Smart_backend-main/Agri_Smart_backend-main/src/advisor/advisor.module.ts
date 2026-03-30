import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvisorController } from './advisor.controller';
import { AdvisorService } from './advisor.service';
import { User } from '../users/user.entity';
import { AdvisorProfile } from '../users/advisor-profile.entity';
import { FarmerProfile } from '../users/farmer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, AdvisorProfile, FarmerProfile])],
  controllers: [AdvisorController],
  providers: [AdvisorService],
  exports: [AdvisorService],
})
export class AdvisorModule {}
