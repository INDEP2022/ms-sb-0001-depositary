import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { CommonFilterQueryService } from 'src/shared/service/common-filter-query.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, CommonFilterQueryService, {
    provide: 'ms-sb-0001-goodsquerydbo',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
            transport: Transport.TCP,
            options: {
                host: configService.get('GOODSQUERYDBO_HOST_NAME'),
                port: configService.get('GOODSQUERYDBO_HOST_PORT'),
            },
        }),
}]
})
export class ApplicationModule {}
