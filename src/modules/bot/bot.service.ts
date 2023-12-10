import { Injectable } from '@nestjs/common';
import {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
} from 'telegraf/src/core/types/typegram';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { StudentDto } from './dto/student.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly httpService: HttpService,
  ) {}

  async createStudent(student: StudentDto) {
    try {
      console.log(student);
      const res = await firstValueFrom(
        this.httpService.post(
          process.env.DIRECTUS_BASE + '/items/students',
          student,
        ),
      );
    } catch (err) {
      console.log(err.message);
      await this.forwardToAdmin(JSON.stringify(student) + ' ' + err.message);
    }
  }

  async getStudent(telegram_id: number) {
    try {
      const { data: students } = await firstValueFrom(
        this.httpService.get(
          process.env.DIRECTUS_BASE +
            `/items/students?filter[telegram_id][_eq]=${telegram_id}&fields=*.*`,
        ),
      );
      return students.data[0];
    } catch (err) {
      console.log(err.message);
      await this.forwardToAdmin(
        JSON.stringify(telegram_id) + ' ' + err.message,
      );
    }
  }
  async updateStudent(student: StudentDto, student_id: number) {
    try {
      const res = await firstValueFrom(
        this.httpService.patch(
          process.env.DIRECTUS_BASE + `/items/students/${student_id}`,
          student,
        ),
      );
    } catch (err) {
      console.log(err.message);
      await this.forwardToAdmin(JSON.stringify(student) + ' ' + err.message);
    }
  }

  async forwardToAdmin(details: string) {
    try {
      await this.bot.telegram.sendMessage(process.env.ADMIN, details);
    } catch (err) {
      console.error(err.message);
    }
  }

  async showMenuButtons(): Promise<InlineKeyboardMarkup> {
    return {
      inline_keyboard: [
        [{ text: 'Сдать Домашку 📚', callback_data: 'submit-homework' }],
      ],
    };
  }

  async getHomework(hm_id: number) {
    try {
      const { data: homework } = await firstValueFrom(
        this.httpService.get(
          process.env.DIRECTUS_BASE +
            `/items/students_homeworks/${hm_id}?fields=*.*`,
        ),
      );
      return homework.data;
    } catch (err) {
      console.log(err);
    }
  }
  async chooseHomework(student_id: number): Promise<InlineKeyboardMarkup> {
    const inline_keyboard = [];
    const day = new Date();
    const { data: homeworks } = await firstValueFrom(
      this.httpService.get(
        process.env.DIRECTUS_BASE +
          `/items/students_homeworks?filter[student_id][_eq]=${student_id}`,
      ),
    );
    let i = 1;
    for (const homework of homeworks.data) {
      inline_keyboard.push([
        {
          text:
            `ДЗ ${i++}` +
            (day > homework.due_to ? ' 🔴' : ' 🟢') +
            ` Набрано: ${homework.score}`,
          callback_data: `hm-${homework.id}`,
        },
      ]);
    }
    return {
      inline_keyboard,
    };
  }

  async showKeyboardMenuButtons(): Promise<ReplyKeyboardMarkup> {
    return {
      keyboard: [[{ text: '🏠 Главное меню' }]],
      resize_keyboard: true,
    };
  }

  async showHomeworkButton(): Promise<InlineKeyboardMarkup> {
    return {
      inline_keyboard: [
        [{ text: 'Приложить файлы', callback_data: 'submit-hm' }],
      ],
    };
  }
}
