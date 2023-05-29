import { Test, TestingModule } from '@nestjs/testing';
import { DepositaryQueriesController } from './depositary-queries.controller';

describe('DepositaryQueriesController', () => {
  let controller: DepositaryQueriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepositaryQueriesController],
    }).compile();

    controller = module.get<DepositaryQueriesController>(DepositaryQueriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
