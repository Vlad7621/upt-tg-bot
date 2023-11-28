import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { DiscordService } from './bot.discord';
import { Context } from 'telegraf';
import { keyboard } from './keyboard/bot.keyboard';


@Injectable()
export class PaymentService {
   constructor(
      private readonly db: DatabaseService,
      private readonly discord: DiscordService
   ) {}


   async confirmPayment(ctx: Context, text: string, id: string, paymentId: string) {
      const discordId = await this.db.getDiscord(+id);
      try {
         if(text.includes('Навчання')) {
            await ctx.telegram.sendMessage(id, `Оплата успішно підтвердженна!\nІдентифікатор оплати: <b>${paymentId}</b>\n<b>Зверніть увагу!</b> Щоб отримати безкоштовний доступ на один місяць до приватного ком'юніті після навчання, вам потрібно перейти в боті в розділ <i>«Мій профіль 👤»</i> і обрати опцію <i>«Отримати підписку 🆓»</i>.`, { parse_mode: 'HTML' });
            return true;
         }
         if(!discordId) {
            await ctx.telegram.sendMessage(id, `Оплата успішно підтвердженна!\nІдентифікатор оплати: <b>${paymentId}</b>\n<b>Зверніть увагу!</b> Щоб отримати доступ до приватного ком'юніті автентифікуйтесь через Discord.`, { ...keyboard.auth, parse_mode: 'HTML' });
            return true;
         }
         const { status } = await this.discord.checkCommunityMember(discordId);
         if(!status) {
            const { inviteUrl } = await this.discord.getInviteUrl();
            await ctx.telegram.sendMessage(id, `Оплата успішно підтвердженна!\nІдентифікатор оплати: <b>${paymentId}</b>\nВаше посилання для приватного ком'юніті - <i>${inviteUrl}</i>\n<b>Зверніть увагу!</b> Не передавайте дане посилання нікому, оскільки воно є одноразове.`, { parse_mode: 'HTML', disable_web_page_preview: true });
            return true;
         }
         await ctx.telegram.sendMessage(id, `Оплата успішно підтвердженна!\nІдентифікатор оплати: <b>${paymentId}</b>`, { parse_mode: 'HTML' });
         return true;
      } catch(err) {
         console.error(err);
      }
      return false;
   }
}