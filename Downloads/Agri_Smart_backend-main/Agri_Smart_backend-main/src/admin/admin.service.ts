import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { AdvisorProfile } from '../users/advisor-profile.entity';
import { MailService } from '../mail/mail.service';
import { UserRole } from '../common/decorators/roles.decorator';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(AdvisorProfile)
    private advisorProfileRepo: Repository<AdvisorProfile>,
    private mailService: MailService,
  ) {}

  async getPendingAdvisors() {
    const advisors = await this.advisorProfileRepo.find({
      where: { isApproved: false },
      relations: ['user'],
    });
    return { data: advisors };
  }

  async approveAdvisor(advisorUserId: string, adminId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: advisorUserId, role: UserRole.ADVISOR },
    });
    if (!user) throw new NotFoundException('Advisor not found');

    const profile = await this.advisorProfileRepo.findOne({
      where: { userId: advisorUserId },
    });
    if (!profile) throw new NotFoundException('Advisor profile not found');

    if (profile.isApproved) {
      return { message: 'Advisor is already approved' };
    }

    // Activate the user and approve profile
    user.isActive = true;
    await this.usersRepo.save(user);

    profile.isApproved = true;
    profile.approvedAt = new Date();
    profile.approvedByAdminId = adminId;
    await this.advisorProfileRepo.save(profile);

    // Send approval email via Nodemailer (Gmail SMTP)
    await this.mailService.sendAdvisorApprovalEmail(
      user.email,
      user.firstName,
    );

    return {
      message: `Advisor ${user.firstName} ${user.lastName} has been approved and notified via email`,
      data: { userId: user.id, email: user.email, approvedAt: profile.approvedAt },
    };
  }

  async getAllUsers(role?: string) {
    const where = role ? { role: role as UserRole } : {};
    const users = await this.usersRepo.find({
      where,
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return { data: users };
  }

  async deactivateUser(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = false;
    await this.usersRepo.save(user);
    return { message: `User ${user.email} has been deactivated` };
  }

  async getPlatformStats() {
    const totalUsers = await this.usersRepo.count();
    const farmers = await this.usersRepo.count({ where: { role: UserRole.FARMER } });
    const advisors = await this.usersRepo.count({ where: { role: UserRole.ADVISOR } });
    const pendingAdvisors = await this.advisorProfileRepo.count({ where: { isApproved: false } });

    return {
      data: {
        totalUsers,
        farmers,
        advisors,
        pendingAdvisors,
        admins: totalUsers - farmers - advisors,
      },
    };
  }
}
