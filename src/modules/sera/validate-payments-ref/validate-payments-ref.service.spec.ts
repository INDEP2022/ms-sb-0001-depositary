import { Test, TestingModule } from '@nestjs/testing';
import { ValidatePaymentsRefService } from './validate-payments-ref.service';

describe('ValidatePaymentsRefService', () => {
  let service: ValidatePaymentsRefService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidatePaymentsRefService],
    }).compile();

    service = module.get<ValidatePaymentsRefService>(ValidatePaymentsRefService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
