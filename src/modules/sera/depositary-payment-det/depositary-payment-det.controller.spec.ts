import { Test, TestingModule } from '@nestjs/testing';
import { DepositaryPaymentDetController } from './depositary-payment-det.controller';

describe('DepositaryPaymentDetController', () => {
  let controller: DepositaryPaymentDetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepositaryPaymentDetController],
    }).compile();

    controller = module.get<DepositaryPaymentDetController>(DepositaryPaymentDetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
