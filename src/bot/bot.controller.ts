import { Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { DatabaseService } from 'src/database/database.service';
import { Context, Telegraf } from 'telegraf';
import { buttons } from './keyboard/bot.buttons';
import { nanoid } from 'nanoid';


interface IPaymentDto {
   id: number;
   firstName: string;
   tariff: string;
   way: string;
   price: string;
}

interface IDiscordDto {
   id: number;
   email: string;
   discordId: number;
}

interface IPayment {
   tariff: string;
   way: string; 
   price: number;
   user: number;
   timestamp: number;
}

interface IPayments {
   [key: string]: IPayment;
}

const groupId = '-1002129116585';

@Controller('bot')
export class BotController {
   constructor(
      @InjectBot() private readonly bot: Telegraf<Context>, 
      private readonly db: DatabaseService
   ) {}

   @Get('check-phone')
   async checkPhone(@Query('id', ParseIntPipe) id: number) {
      const isPhone = await this.db.isPhone(id);
      return { status: isPhone };
   }

   @Post('create-payment')
   async createPayment(@Body() dto: IPaymentDto) {
      const { id, firstName, tariff, way, price } = dto;
      const { phone } = await this.db.getUser(+id);
      const paymentId = nanoid();
      await Promise.all([
         await this.db.createPayment(id, paymentId, tariff, way, price),
         await this.bot.telegram.sendContact(groupId, phone, firstName),
         await this.bot.telegram.sendMessage(groupId, `<b>Оплата: ${paymentId}</b>\n\nВибраний тариф: <i>${tariff}</i>\nСпосіб оплати: <i>${way}</i>\nСума до оплати: <i>${price}$</i>\nСтатус: <i>Очікує перевірки</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
               inline_keyboard: [
                  [{ text: buttons.payment.confirm, callback_data: `confirm&${id}&${paymentId}` }],
                  [{ text: buttons.payment.reject, callback_data: `reject&${id}&${paymentId}` }]
               ]
            }
         })
      ]);
      await this.bot.telegram.sendMessage(id, `Дякуємо! Незабаром з вами зв'яжеться адміністратор для підтвердження оплати.`);
      return { payment: true };
   }

   @Get('check-discord')
   async checkDiscord(@Query('id', ParseIntPipe) id: number) {
      const discordId = await this.db.getDiscord(id);
      return { status: !!discordId };
   }

   @Post('add-discord')
   async addDiscord(@Body() dto: IDiscordDto) {
      const { id, email, discordId } = dto;
      await this.db.addDisocrd(id, email, discordId);

      return { status: true };
   }

   @Get('get-payments')
   async getPayments(@Query('id', ParseIntPipe) id: number): Promise<IPayments> {
      const payments = await this.db.getPayments(id);
      return payments;
   }

   @Get('send-invite')
   async sendInvite(@Query('id', ParseIntPipe) id: number, @Query('url') inviteUrl: string) {
      await this.bot.telegram.sendMessage(id, `Ваше посилання для приватного ком'юніті - <i>${inviteUrl}</i>\n<b>Зверніть увагу!</b> Не передавайте дане посилання нікому, оскільки воно є одноразове.`, { parse_mode: 'HTML', disable_web_page_preview: true });
   }
}
