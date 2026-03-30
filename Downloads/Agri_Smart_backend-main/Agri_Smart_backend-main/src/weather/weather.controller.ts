import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Weather')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'List supported Rwandan districts' })
  getDistricts() {
    return { data: this.weatherService.getSupportedDistricts() };
  }

  @Get(':district')
  @ApiOperation({ summary: 'Get live weather data for a Rwandan district' })
  getWeather(@Param('district') district: string) {
    return this.weatherService.getWeatherForDistrict(district);
  }
}

