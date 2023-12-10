import { Injectable } from '@nestjs/common';
import { Ctx, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';
import { SceneContext } from 'telegraf/typings/scenes';

@Injectable()
@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly botService: BotService,
  ) {}

  @Start()
  async start(@Ctx() ctx: SceneContext) {
    try {
      await ctx.reply(
        `👋 Добро пожаловать в ChinoeshSupportBot - твоего личного помощника по курсу арбитража!\n\n` +
          `📚💼 Здесь ты можешь получить задания и отправить его на проверку.\n` +
          `Чтобы вызвать меню, напиши команду /menu.\n` +
          `🗂️🔍 Удачи в обучении! 📚🌟 ${ctx.message.from.first_name}\n\n` +
          `С уважением, ChinoeshSupportBot 🤖`,
        {
          reply_markup: await this.botService.showKeyboardMenuButtons(),
        },
      );
      const student = {
        firstname: ctx.from.first_name,
        lastname: ctx.from.last_name,
        telegram_nick: ctx.from.username,
        telegram_id: ctx.from.id,
      };
      await this.botService.createStudent(student);
      await ctx.scene.enter('base');
    } catch (err) {}
  }
}
