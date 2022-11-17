import { Test, TestingModule } from '@nestjs/testing';
import { RefPagoController } from './ref-pago.controller';

describe('RefPagoController', () => {
  let controller: RefPagoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefPagoController],
    }).compile();

    controller = module.get<RefPagoController>(RefPagoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
