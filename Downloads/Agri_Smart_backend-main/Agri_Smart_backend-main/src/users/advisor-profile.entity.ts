import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('advisor_profiles')
export class AdvisorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  certificationNumber: string;

  @Column({ nullable: true })
  certificationDocUrl: string;

  @Column({ nullable: true })
  organisation: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedByAdminId: string;

  @Column({ type: 'simple-array', nullable: true })
  coveredDistricts: string[];

  @Column({ type: 'simple-array', nullable: true })
  expertiseCrops: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
