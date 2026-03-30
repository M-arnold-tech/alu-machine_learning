import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CropCalendar } from './crop-calendar.entity';

@Injectable()
export class CropCalendarService {
  constructor(
    @InjectRepository(CropCalendar)
    private calendarRepo: Repository<CropCalendar>,
  ) {}

  async createTask(advisorId: string, dto: Partial<CropCalendar>) {
    const task = this.calendarRepo.create({ ...dto, advisorId });
    return { data: await this.calendarRepo.save(task) };
  }

  async getByDistrict(district: string) {
    const tasks = await this.calendarRepo.find({ where: { district }, order: { dueDate: 'ASC' } });
    return { data: tasks };
  }

  async getAll() {
    return { data: await this.calendarRepo.find({ order: { dueDate: 'ASC' } }) };
  }

  async updateTask(id: string, dto: Partial<CropCalendar>) {
    const task = await this.calendarRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    Object.assign(task, dto);
    return { data: await this.calendarRepo.save(task) };
  }

  async removeTask(id: string) {
    const task = await this.calendarRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.calendarRepo.remove(task);
    return { message: 'Task removed' };
  }
}
