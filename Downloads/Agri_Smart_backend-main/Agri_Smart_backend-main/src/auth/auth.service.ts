import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { FarmerProfile } from '../users/farmer-profile.entity';
import { AdvisorProfile } from '../users/advisor-profile.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole } from '../common/decorators/roles.decorator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(FarmerProfile)
    private farmerProfileRepo: Repository<FarmerProfile>,
    @InjectRepository(AdvisorProfile)
    private advisorProfileRepo: Repository<AdvisorProfile>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = this.usersRepo.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: dto.role,
      // Advisors are inactive until approved by admin
      isActive: dto.role !== UserRole.ADVISOR,
    });

    const savedUser = await this.usersRepo.save(user);

    if (dto.role === UserRole.FARMER) {
      const profile = this.farmerProfileRepo.create({
        userId: savedUser.id,
        district: dto.district,
        crops: dto.crops,
        landSizeHectares: dto.landSizeHectares,
      });
      await this.farmerProfileRepo.save(profile);
    }

    if (dto.role === UserRole.ADVISOR) {
      const profile = this.advisorProfileRepo.create({
        userId: savedUser.id,
        specialization: dto.specialization,
        certificationNumber: dto.certificationNumber,
        isApproved: false,
      });
      await this.advisorProfileRepo.save(profile);
    }

    const { password, ...result } = savedUser;
    return {
      message:
        dto.role === UserRole.ADVISOR
          ? 'Registration successful. Your account is pending admin approval.'
          : 'Registration successful. Welcome to AgriSmart!',
      data: result,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Your account is pending approval or has been deactivated',
      );
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...userData } = user;
    return {
      message: 'Login successful',
      data: {
        accessToken: token,
        user: userData,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const { password, ...result } = user;
    return { data: result };
  }
}
