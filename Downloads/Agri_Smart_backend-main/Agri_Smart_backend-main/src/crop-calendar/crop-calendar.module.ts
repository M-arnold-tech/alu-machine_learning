import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropCalendarController } from './crop-calendar.controller';
import { CropCalendarService } from './crop-calendar.service';
import { CropCalendar } from './crop-calendar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CropCalendar])],
  controllers: [CropCalendarController],
  providers: [CropCalendarService],
})
export class CropCalendarModule {}
