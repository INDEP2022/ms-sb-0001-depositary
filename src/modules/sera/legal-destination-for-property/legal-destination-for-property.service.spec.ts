import { Test, TestingModule } from '@nestjs/testing';
import { LegalDestinationForPropertyService } from './legal-destination-for-property.service';

describe('LegalDestinationForPropertyService', () => {
  let service: LegalDestinationForPropertyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalDestinationForPropertyService],
    }).compile();

    service = module.get<LegalDestinationForPropertyService>(LegalDestinationForPropertyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
