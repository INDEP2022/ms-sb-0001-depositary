import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';


async function bootstrap() {

  const ms_port_micro = process.env.MS_PORT_MICRO ? Number(process.env.MS_PORT_MICRO) : 3001;
  const app_port = process.env.HOST_PORT ? Number(process.env.HOST_PORT) : 3000;
  const host_name = process.env.HOST_NAME ? process.env.HOST_NAME : '0.0.0.0';

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: host_name,
      port: ms_port_micro
    }
  });
  app.listen();
  console.log(`Microservice listening INTERNAL${process.env.MS_NAME} on Enviroment:`, process.env.ENV);
  console.log(`Microservice listening INTERNAL${process.env.MS_NAME} name:`, process.env.MS_NAME);
  console.log(`Microservice listening INTERNAL${process.env.MS_NAME} on ports:`, app_port + ":" + ms_port_micro);
  console.log(`Microservice INTERNAL${process.env.MS_NAME} is running on: ${ms_port_micro}`);
  console.log(`Host name: ${host_name}`);
}
bootstrap();