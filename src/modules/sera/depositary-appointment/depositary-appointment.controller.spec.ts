import { Test, TestingModule } from '@nestjs/testing';
import { DepositaryAppointmentController } from './depositary-appointment.controller';

describe('DepositaryAppointmentController', () => {
  let controller: DepositaryAppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepositaryAppointmentController],
    }).compile();

    controller = module.get<DepositaryAppointmentController>(DepositaryAppointmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
