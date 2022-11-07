import { Test, TestingModule } from '@nestjs/testing';
import { ExpExel2Service } from './exp-exel-2.service';

describe('ExpExel2Service', () => {
  let service: ExpExel2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpExel2Service],
    }).compile();

    service = module.get<ExpExel2Service>(ExpExel2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
