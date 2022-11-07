import { Test, TestingModule } from '@nestjs/testing';
import { LoadClientService } from './load-client.service';

describe('LoadClientService', () => {
  let service: LoadClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadClientService],
    }).compile();

    service = module.get<LoadClientService>(LoadClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
