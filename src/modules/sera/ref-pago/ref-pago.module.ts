import { Module } from '@nestjs/common';
import { RefPagoController } from './ref-pago.controller';
import { RefPagoService } from './ref-pago.service';

@Module({
  controllers: [RefPagoController],
  providers: [RefPagoService]
})
export class RefPagoModule {}
