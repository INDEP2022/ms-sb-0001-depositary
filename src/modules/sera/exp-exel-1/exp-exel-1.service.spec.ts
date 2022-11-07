import { Test, TestingModule } from '@nestjs/testing';
import { ExpExel1Service } from './exp-exel-1.service';

describe('ExpExel1Service', () => {
  let service: ExpExel1Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpExel1Service],
    }).compile();

    service = module.get<ExpExel1Service>(ExpExel1Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
