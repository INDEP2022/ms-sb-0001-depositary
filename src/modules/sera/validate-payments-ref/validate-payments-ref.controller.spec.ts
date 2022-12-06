import { Test, TestingModule } from '@nestjs/testing';
import { ValidatePaymentsRefController } from './validate-payments-ref.controller';

describe('ValidatePaymentsRefController', () => {
  let controller: ValidatePaymentsRefController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidatePaymentsRefController],
    }).compile();

    controller = module.get<ValidatePaymentsRefController>(ValidatePaymentsRefController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
