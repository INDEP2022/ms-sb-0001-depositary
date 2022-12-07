import { Test, TestingModule } from '@nestjs/testing';
import { ComerPaymentService } from './comer-payment.service';

describe('ComerPaymentService', () => {
  let service: ComerPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComerPaymentService],
    }).compile();

    service = module.get<ComerPaymentService>(ComerPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
