import { Test, TestingModule } from '@nestjs/testing';
import { LegalDestinationForPropertyController } from './legal-destination-for-property.controller';

describe('LegalDestinationForPropertyController', () => {
  let controller: LegalDestinationForPropertyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalDestinationForPropertyController],
    }).compile();

    controller = module.get<LegalDestinationForPropertyController>(LegalDestinationForPropertyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
