import { Body, Controller, Post } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly botService: BotService,
  ) {}
  @Post('assigned-task')
  async assignedTask(@Body('telegram_id') tg_id: any) {
    try {
      await this.bot.telegram.sendMessage(
        tg_id,
        'У вас новое задание. Для того чтобы найти задание нажмите на меню и дальше следуйте по кнопкам.\n' +
          'Если у вас возникли проблемы с домашнем заданием то обратитесь техническому специалисту https://t.me/DoubledBo.',
      );
    } catch (err) {
      await this.botService.forwardToAdmin(err.message + ' ' + 'tg_id');
    }
  }
}
