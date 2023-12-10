import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { BaseScene } from './scenes/base.scene';
import { SubmitHomeworkScene } from './scenes/submit-homework.scene';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [BotUpdate, BotService, BaseScene, SubmitHomeworkScene],
})
export class BotModule {}
