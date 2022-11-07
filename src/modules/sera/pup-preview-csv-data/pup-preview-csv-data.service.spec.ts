import { Test, TestingModule } from '@nestjs/testing';
import { PupPreviewCsvDataService } from './pup-preview-csv-data.service';

describe('PupPreviewCsvDataService', () => {
  let service: PupPreviewCsvDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PupPreviewCsvDataService],
    }).compile();

    service = module.get<PupPreviewCsvDataService>(PupPreviewCsvDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
