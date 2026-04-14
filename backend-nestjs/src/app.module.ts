import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CepModule } from './modules/cep/cep.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/conquis_dev',
      }),
      inject: [ConfigService],
    }),
    CepModule,
    // AreasModule and IntegrationModule removed — out of scope for this CEP-only migration
    // AiAssistantModule removed — depends on TypeORM/pgvector, out of scope
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
