import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmerController } from './farmer.controller';
import { FarmerService } from './farmer.service';
import { User } from '../users/user.entity';
import { FarmerProfile } from '../users/farmer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, FarmerProfile])],
  controllers: [FarmerController],
  providers: [FarmerService],
  exports: [FarmerService],
})
export class FarmerModule {}
