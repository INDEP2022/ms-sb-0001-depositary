import { Test, TestingModule } from '@nestjs/testing';
import { ExpExel2Controller } from './exp-exel-2.controller';

describe('ExpExel2Controller', () => {
  let controller: ExpExel2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpExel2Controller],
    }).compile();

    controller = module.get<ExpExel2Controller>(ExpExel2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
