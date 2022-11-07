import { Test, TestingModule } from '@nestjs/testing';
import { PupPreviewCsvDataController } from './pup-preview-csv-data.controller';

describe('PupPreviewCsvDataController', () => {
  let controller: PupPreviewCsvDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PupPreviewCsvDataController],
    }).compile();

    controller = module.get<PupPreviewCsvDataController>(PupPreviewCsvDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
