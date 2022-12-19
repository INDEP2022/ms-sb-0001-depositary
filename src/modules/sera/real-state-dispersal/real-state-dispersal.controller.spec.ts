import { Test, TestingModule } from '@nestjs/testing';
import { RealStateDispersalController } from './real-state-dispersal.controller';

describe('RealStateDispersalController', () => {
  let controller: RealStateDispersalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RealStateDispersalController],
    }).compile();

    controller = module.get<RealStateDispersalController>(RealStateDispersalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
