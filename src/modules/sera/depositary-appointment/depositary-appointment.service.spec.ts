import { Test, TestingModule } from '@nestjs/testing';
import { DepositaryAppointmentService } from './depositary-appointment.service';

describe('DepositaryAppointmentService', () => {
  let service: DepositaryAppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepositaryAppointmentService],
    }).compile();

    service = module.get<DepositaryAppointmentService>(DepositaryAppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
