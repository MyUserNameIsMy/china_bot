import { Injectable } from '@nestjs/common';
import { Ctx, Hears, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { BotService } from '../bot.service';
import { Context } from 'telegraf';
import { ISession } from '../../../common/interfaces/session.interface';

@Injectable()
@Scene('submitHomework')
export class SubmitHomeworkScene {
  constructor(private readonly botService: BotService) {}

  @SceneEnter()
  async enter(@Ctx() ctx: SceneContext & ISession) {
    await ctx.replyWithHTML(
      `**Отправка домашнего задания. Отправьте домашнее задание в виде файлов или фото/скриншотов по одному.** *🚫 Текст не принимается.* **Убедитесь что получили сообщение файл принят для каждого отправленного файла.** **Для того чтобы выйти или завершить отправку, нажмите на** *Меню* **и выберите** *Меню бота* **или** *Главное меню*.`,
      {
        parse_mode: 'Markdown',
      },
    );
  }

  @Hears('/menu')
  async returnBase(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter('base');
  }

  @Hears('🏠 Главное меню')
  async returnBase2(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter('base');
  }

  @On('message')
  async submitToChannel(@Ctx() ctx: Context & SceneContext) {
    try {
      await ctx.telegram.sendMessage(
        ctx.session['hm_channel'],
        `Student ${ctx.from.id} ${
          ctx.from.username
        } Homework ID: *${ctx.session['hm'].replace(/\D/g, '')}*`,
        { parse_mode: 'Markdown' },
      );
      await ctx.copyMessage(ctx.session['hm_channel']);
      await ctx.reply('Файл принят');
    } catch (err) {
      await this.botService.forwardToAdmin(
        err.message + `${ctx.message.from.id} ${ctx.message.from.username}`,
      );
      await ctx.reply(
        'Возникли проблемы при отправке домашнего задания. Свяжитесь с техническим специалистом @DoubledBo.',
      );
    }
  }
}
