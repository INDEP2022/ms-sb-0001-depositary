import { Test, TestingModule } from '@nestjs/testing';
import { ComerPaymentController } from './comer-payment.controller';

describe('ComerPaymentController', () => {
  let controller: ComerPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComerPaymentController],
    }).compile();

    controller = module.get<ComerPaymentController>(ComerPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
