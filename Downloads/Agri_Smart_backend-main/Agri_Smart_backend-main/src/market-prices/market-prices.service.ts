import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { MarketPrice } from './market-price.entity';

/** Shape of one record returned by the HDX HAPI endpoint */
interface HdxRecord {
  commodity_name: string;
  market_name: string;
  price: number;
  currency_name: string;
  unit_name: string;
  reference_period_start: string;
}

@Injectable()
export class MarketPricesService {
  private readonly logger = new Logger(MarketPricesService.name);

  constructor(
    @InjectRepository(MarketPrice)
    private readonly priceRepo: Repository<MarketPrice>,
    private readonly config: ConfigService,
  ) {}

  // ─── Public Methods ──────────────────────────────────────────────────────────

  async getAll() {
    const dbPrices = await this.priceRepo.find({ order: { updatedAt: 'DESC' } });

    if (dbPrices.length === 0) {
      // No cached data — fetch live and return
      this.logger.log('DB empty — fetching live market prices from HDX HAPI...');
      await this.syncFromHdx();
      return { data: await this.priceRepo.find({ order: { updatedAt: 'DESC' } }) };
    }

    // Return cached data immediately; refresh in background if older than 6 h
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    if (dbPrices[0].updatedAt < sixHoursAgo) {
      this.logger.log('Prices stale — refreshing from HDX HAPI in background...');
      this.syncFromHdx().catch((e) =>
        this.logger.error(`Background HDX sync failed: ${e.message}`),
      );
    }

    return { data: dbPrices };
  }

  async upsertPrice(dto: Partial<MarketPrice>) {
    const existing = await this.priceRepo.findOne({
      where: { crop: dto.crop!, market: dto.market! },
    });
    if (existing) {
      Object.assign(existing, dto);
      return { data: await this.priceRepo.save(existing) };
    }
    const price = this.priceRepo.create(dto);
    return { data: await this.priceRepo.save(price) };
  }

  // ─── HDX HAPI Sync ───────────────────────────────────────────────────────────

  private async syncFromHdx(): Promise<void> {
    const baseUrl = this.config.get<string>('marketPrices.apiUrl')!;
    const appId   = this.config.get<string>('marketPrices.appId') || '';

    const url = `${baseUrl}?location_name=Rwanda&output_format=json&limit=100`;

    this.logger.log(`Fetching HDX HAPI: ${url}`);

    let records: HdxRecord[] = [];
    try {
      const res = await fetch(url, {
        headers: {
          ...(appId ? { 'X-HDX-HAPI-APP-IDENTIFIER': appId } : {}),
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const json: any = await res.json();

      // HDX HAPI wraps results under `data`
      records = (json?.data ?? json?.results ?? []) as HdxRecord[];
    } catch (err: any) {
      this.logger.error(`HDX HAPI fetch failed: ${err.message}`);
      return;
    }

    if (!records.length) {
      this.logger.warn('HDX HAPI returned 0 records for Rwanda.');
      return;
    }

    let upserted = 0;
    for (const r of records) {
      try {
        await this.upsertPrice({
          crop:         r.commodity_name,
          market:       r.market_name,
          pricePerKg:   r.price,
          currency:     r.currency_name,
          source:       `HDX HAPI / WFP VAM (${r.reference_period_start})`,
        });
        upserted++;
      } catch (e: any) {
        this.logger.warn(`Failed to upsert ${r.commodity_name}: ${e.message}`);
      }
    }
    this.logger.log(`HDX HAPI sync complete — ${upserted}/${records.length} records upserted.`);
  }
}


