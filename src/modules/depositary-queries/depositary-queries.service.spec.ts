import { Test, TestingModule } from '@nestjs/testing';
import { DepositaryQueriesService } from './depositary-queries.service';

describe('DepositaryQueriesService', () => {
  let service: DepositaryQueriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepositaryQueriesService],
    }).compile();

    service = module.get<DepositaryQueriesService>(DepositaryQueriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
