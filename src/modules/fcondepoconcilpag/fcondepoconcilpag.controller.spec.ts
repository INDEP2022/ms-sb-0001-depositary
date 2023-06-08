import { Test, TestingModule } from '@nestjs/testing';
import { FcondepoconcilpagController } from './fcondepoconcilpag.controller';

describe('FcondepoconcilpagController', () => {
  let controller: FcondepoconcilpagController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FcondepoconcilpagController],
    }).compile();

    controller = module.get<FcondepoconcilpagController>(FcondepoconcilpagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
