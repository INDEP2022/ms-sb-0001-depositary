import { Test, TestingModule } from '@nestjs/testing';
import { DepositaryPaymentDetService } from './depositary-payment-det.service';

describe('DepositaryPaymentDetService', () => {
  let service: DepositaryPaymentDetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepositaryPaymentDetService],
    }).compile();

    service = module.get<DepositaryPaymentDetService>(DepositaryPaymentDetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
