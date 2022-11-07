import { Test, TestingModule } from '@nestjs/testing';
import { LoadClientController } from './load-client.controller';

describe('LoadClientController', () => {
  let controller: LoadClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoadClientController],
    }).compile();

    controller = module.get<LoadClientController>(LoadClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
