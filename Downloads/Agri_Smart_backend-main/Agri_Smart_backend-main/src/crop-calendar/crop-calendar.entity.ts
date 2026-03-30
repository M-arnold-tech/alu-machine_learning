import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('crop_calendar')
export class CropCalendar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  crop: string;

  @Column()
  taskName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  district: string;

  @Column({ type: 'date' })
  dueDate: string;

  @Column()
  advisorId: string;

  @Column({ default: false })
  notified: boolean;

  @Column({ nullable: true })
  notifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
