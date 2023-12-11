import { Injectable } from '@nestjs/common';
import {
  Action,
  Ctx,
  Hears,
  InjectBot,
  Scene,
  SceneEnter,
} from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { BotService } from '../bot.service';
import { ISession } from '../../../common/interfaces/session.interface';
import { Context, Telegraf } from 'telegraf';

@Injectable()
@Scene('base')
export class BaseScene {
  constructor(
    private readonly botService: BotService,
    @InjectBot() private readonly bot: Telegraf<Context>,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: SceneContext) {
    try {
      const student = {
        firstname: ctx.from.first_name,
        lastname: ctx.from.last_name,
        telegram_nick: ctx.from.username,
        telegram_id: ctx.from.id,
      };
      const student_system = await this.botService.getStudent(
        student.telegram_id,
      );
      if (student_system.status == 'active') {
        ctx.session['student_id'] = student_system.id;
        ctx.session['hm_channel'] = student_system['kurator_id']['channel_id'];
        await this.botService.updateStudent(student, student_system.id);
        await ctx.reply('Mеню', {
          reply_markup: await this.botService.showMenuButtons(),
        });
      } else {
        await ctx.reply(
          'Ваш аккаунт не активный. Свяжитесь с https://t.me/DoubledBo',
        );
        await this.botService.forwardToAdmin(
          student.telegram_id + ' ' + student.telegram_nick + ' не активный',
        );
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  @Hears('/menu')
  async returnBase(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter('base');
  }

  @Hears('🏠 Главное меню')
  async returnBase2(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter('base');
  }

  @Action(/submit-homework/)
  async onSubmitHomework(@Ctx() ctx: SceneContext) {
    try {
      await ctx.deleteMessage();
      await ctx.reply(
        'Выберите домашнее задание которое хотите отправить.\n🔴 означает что время отправки прошло.\n🟢 означает можно еще сдавать.\nЕсли нет заданий, то вам еще не назначали задание.',
        {
          reply_markup: await this.botService.chooseHomework(
            ctx.session['student_id'],
          ),
        },
      );
    } catch (err) {
      console.error(err.message);
    }
  }

  @Action(/hm-/)
  async onChooseHomework(@Ctx() ctx: SceneContext & ISession) {
    try {
      await ctx.deleteMessage();
      ctx.session['hm'] = ctx.update['callback_query']['data'];
      const hm = ctx.update['callback_query']['data'];
      const hm_id = hm.replace(/\D/g, '');
      const homework = await this.botService.getHomework(hm_id);
      const day = new Date();
      await ctx.reply(
        `*Срок сдачи до ${new Date(homework.due_to).toDateString()}*`,
        { parse_mode: 'Markdown' },
      );
      await ctx.reply(homework.homework_id.description);
      if (homework.due_to < day) {
        await ctx.replyWithHTML(`*Время отправки домашнего задания прошло.*`, {
          parse_mode: 'Markdown',
        });
        await ctx.scene.enter('base');
      } else {
        await ctx.reply(
          '**Для того чтобы выйти или завершить отправку, нажмите на** *Меню* **и выберите** *Меню бота* **или** *Главное меню*. *Чтобы начать сдачу задания обязательно сначала нажмите приложить файлы и только затем отправляйте файлы.*',
          {
            parse_mode: 'Markdown',
            reply_markup: await this.botService.showHomeworkButton(),
          },
        );
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  @Action(/submit-hm/)
  async enterSubmitHm(@Ctx() ctx: SceneContext & ISession) {
    await ctx.scene.enter('submitHomework');
  }
}
