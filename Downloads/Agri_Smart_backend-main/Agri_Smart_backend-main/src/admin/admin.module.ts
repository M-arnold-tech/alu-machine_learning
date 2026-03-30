import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { AdvisorProfile } from '../users/advisor-profile.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, AdvisorProfile]), MailModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
