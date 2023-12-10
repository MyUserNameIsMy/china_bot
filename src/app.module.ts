import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TelegrafModule } from 'nestjs-telegraf';
import { getJWTConfig } from './config/jwt.config';
import { getTelegrafAsyncConfig } from './config/telegraf-async.config';
import { BotModule } from './modules/bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync(getJWTConfig()),
    TelegrafModule.forRootAsync(getTelegrafAsyncConfig()),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
