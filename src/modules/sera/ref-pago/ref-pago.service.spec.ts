import { Test, TestingModule } from '@nestjs/testing';
import { RefPagoService } from './ref-pago.service';

describe('RefPagoService', () => {
  let service: RefPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefPagoService],
    }).compile();

    service = module.get<RefPagoService>(RefPagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
