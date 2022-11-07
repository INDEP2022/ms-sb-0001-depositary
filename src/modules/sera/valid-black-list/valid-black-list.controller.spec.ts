import { Test, TestingModule } from '@nestjs/testing';
import { ValidBlackListController } from './valid-black-list.controller';

describe('ValidBlackListController', () => {
  let controller: ValidBlackListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidBlackListController],
    }).compile();

    controller = module.get<ValidBlackListController>(ValidBlackListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
