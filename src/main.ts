import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule,{
    transport: Transport.TCP,
    options:{
      host:'127.0.0.1',
      port: process.env.MS_PORT_MICRO ? Number(process.env.MS_PORT_MICRO) : 3000
    }
  });
  app.listen();
  console.log(`Microservice listening INTERNAL${process.env.MS_NAME} on Enviroment:`, process.env.ENV);
  console.log(`Microservice listening INTERNAL${process.env.MS_NAME} name:`, process.env.MS_NAME);
  console.log(`Microservice listening INTERNAL${process.env.MS_NAME} on ports:`, process.env.MS_PORT_MICRO);
}
bootstrap();