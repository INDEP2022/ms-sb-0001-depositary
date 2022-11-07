import { Test, TestingModule } from '@nestjs/testing';
import { ExpExel1Controller } from './exp-exel-1.controller';

describe('ExpExel1Controller', () => {
  let controller: ExpExel1Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpExel1Controller],
    }).compile();

    controller = module.get<ExpExel1Controller>(ExpExel1Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
