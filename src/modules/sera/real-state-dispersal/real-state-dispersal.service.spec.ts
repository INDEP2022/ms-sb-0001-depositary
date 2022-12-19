import { Test, TestingModule } from '@nestjs/testing';
import { RealStateDispersalService } from './real-state-dispersal.service';

describe('RealStateDispersalService', () => {
  let service: RealStateDispersalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealStateDispersalService],
    }).compile();

    service = module.get<RealStateDispersalService>(RealStateDispersalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
