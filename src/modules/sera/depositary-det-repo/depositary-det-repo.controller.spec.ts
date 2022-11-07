import { Test, TestingModule } from '@nestjs/testing';
import { DepositaryDetRepoController } from './depositary-det-repo.controller';

describe('DepositaryDetRepoController', () => {
  let controller: DepositaryDetRepoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepositaryDetRepoController],
    }).compile();

    controller = module.get<DepositaryDetRepoController>(DepositaryDetRepoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
