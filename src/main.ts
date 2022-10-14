import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule,{
    transport: Transport.TCP,
    options:{
      host:'127.0.0.1',
      port:3002
    }
  });
  app.listen();
}
bootstrap();


/*

template en 3:
 - api 
  - conexion db

 - microservicio
  - nuevos host y puertos (microservice)
  - se cambian peticiones (vebos) con { cmd: ''}

 - api gateway
  - recibe petición  y dirige al microservice correspondiente mediante cmd (comand)


  ALTER TABLE sae_nsbdb.cat_aclaraciones ADD PRIMARY KEY(idaclaraciones)
  ALTER TABLE sae_nsbdb.cat_aclaraciones ALTER COLUMN idaclaraciones ADD GENERATED ALWAYS AS IDENTITY;

  revisar cada una de las tablas - por ejemplo en el catalogo id tenia que ser integer en lugar de number
 */
