import { Module } from '@nestjs/common';
import { PupPreviewCsvDataController } from './pup-preview-csv-data.controller';
import { PupPreviewCsvDataService } from './pup-preview-csv-data.service';

@Module({
  controllers: [PupPreviewCsvDataController],
  providers: [PupPreviewCsvDataService]
})
export class PupPreviewCsvDataModule {}
