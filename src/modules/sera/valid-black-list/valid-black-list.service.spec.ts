import { Test, TestingModule } from '@nestjs/testing';
import { ValidBlackListService } from './valid-black-list.service';

describe('ValidBlackListService', () => {
  let service: ValidBlackListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidBlackListService],
    }).compile();

    service = module.get<ValidBlackListService>(ValidBlackListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
