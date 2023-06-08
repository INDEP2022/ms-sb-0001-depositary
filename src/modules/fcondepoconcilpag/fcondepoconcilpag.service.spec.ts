import { Test, TestingModule } from '@nestjs/testing';
import { FcondepoconcilpagService } from './fcondepoconcilpag.service';

describe('FcondepoconcilpagService', () => {
  let service: FcondepoconcilpagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FcondepoconcilpagService],
    }).compile();

    service = module.get<FcondepoconcilpagService>(FcondepoconcilpagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
