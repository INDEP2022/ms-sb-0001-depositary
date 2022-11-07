import { Test, TestingModule } from '@nestjs/testing';
import { DepositaryDetRepoService } from './depositary-det-repo.service';

describe('DepositaryDetRepoService', () => {
  let service: DepositaryDetRepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepositaryDetRepoService],
    }).compile();

    service = module.get<DepositaryDetRepoService>(DepositaryDetRepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
