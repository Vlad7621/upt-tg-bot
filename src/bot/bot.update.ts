import { Context, deunionize } from 'telegraf';
import { Action, Command, Ctx, Hears, Next, On, Update } from 'nestjs-telegraf';
import { DatabaseService } from 'src/database/database.service';
import { keyboard } from './keyboard/bot.keyboard';
import { buttons } from './keyboard/bot.buttons';
import { links } from 'src/helpers/links';
import { PaymentService } from './bot.payment';
import { DiscordService } from './bot.discord';


@Update()
export class BotUpdate {
   constructor(
      private readonly db: DatabaseService,
      private readonly payment: PaymentService,
      private readonly discord: DiscordService,
   ) {}

   @Command('start')
   async onStart(@Ctx() ctx: Context) {
      const isUser = await this.db.auth(ctx.chat.id);
      try {
         if(isUser) {
            await ctx.replyWithHTML('Меню:', keyboard.menu);
         }
         else {
            await ctx.replyWithHTML('Вас вітає команда <b>ULTRA PROFIT TRADE!</b>\n\nМеню:', keyboard.menu); 
         }
      } catch(err) {
         console.error(err);
      }
   }

   @Command('restart')
   async onRestart(@Ctx() ctx: Context) {
      try {
         await ctx.replyWithHTML('Меню:', keyboard.menu);
      } catch(err) {
         console.error(err);
      }
   }

   @Hears(buttons.menu.study)
   async onStudy(@Ctx() ctx: Context) {
      try {
         await ctx.replyWithHTML('Основна інформація про навчання та оплату знаходиться нижче👇', keyboard.study);
      } catch(err) {
         console.error(err);
      }
   }

   @Hears(buttons.menu.privateChannel)
   async onPrivateChannel(@Ctx() ctx: Context) {
      try {
         await ctx.replyWithHTML(`Основна інформація про приватне ком'юніті та оплату знаходиться нижче👇`, keyboard.privateChannel);
      } catch(err) {
         console.error(err);
      }
   }

   @Hears(buttons.menu.myProfile)
   async onMyProfile(@Ctx() ctx: Context) {
      const info = await this.db.getProfile(ctx.chat.id);
      try {
         if(info) {
            await ctx.replyWithHTML(info, keyboard.myProfile);
         }
         else {
            await ctx.replyWithHTML('Наразі ви не здійснили жодної оплати.'); 
         }
      } catch(err) {
         console.error(err);
      }
   }

   @Hears(buttons.menu.feedback)
   async onFeedback(@Ctx() ctx: Context) {
      try {
         await ctx.replyWithHTML('<b>Адмін:</b> <i>@ultraprofittradee</i>');
      } catch(err) {
         console.error(err);
      }
   }

   @Hears(buttons.menu.links)
   async onLinks(@Ctx() ctx: Context) {
      try {
         await ctx.replyWithHTML(links.join('\n\n'), { disable_web_page_preview: true });
      } catch(err) {
         console.error(err);
      }
   }

   @On('contact')
   async onContact(@Ctx() ctx: Context) {
      const { contact } = deunionize(ctx.message);
      try {
         await this.db.addPhone(ctx.chat.id, contact.phone_number);
      } catch(err) {
         console.error(err);
      }
   }

   @Action('UPTEDUCATIONPRESENTATION')
   async onStudyPresentation(@Ctx() ctx: Context) {
      try {
         await ctx.sendDocument('BQACAgIAAxkBAAIHnWVTyYCakD0be9xHgsfDRLZmpWC-AAJVNwACY7agSkFDXTQItYW8MwQ');
      } catch(err) {
         console.error(err);
      }

   }

   @Action('UPTPRIVATEPRESENTATION')
   async onPrivatePresentation(@Ctx() ctx: Context) {
      try {
         await ctx.sendDocument('BQACAgIAAxkBAAIHqWVTyowJ1mC4SNcVmclKFM_6OnOIAAJkNwACY7agSrwbk_b5lc41MwQ');
      } catch(err) {
         console.error(err);
      }
   }

   @Action('get-subscription')
   async onGetSubscription(@Ctx() ctx: Context) {
      const discordId = await this.db.getDiscord(ctx.chat.id);
      try {
         if(!discordId) {
            await ctx.replyWithHTML(`Щоб отримати безкоштовний доступ до приватного ком'юніті після навчання автентифікуйтесь через Discord.`, keyboard.auth);
         }
         else {
            const { status } = await this.discord.checkCommunityMember(discordId);
            if(status) {
               await ctx.replyWithHTML('Ви можете получити доступ');
            }
            else {
               await ctx.replyWithHTML(`Безкоштовний доступ до приватного ком'юніті можна отримати після навчання.`);
            }
         }
      } catch(err) {
         console.error(err);
      }
   }

   @On('callback_query')
   async onCallbackQuery(@Ctx() ctx: Context, @Next() next) {
      const query = deunionize(ctx.callbackQuery);
      const { text, entities } = deunionize(query.message);
      if(!text || !query.data) return next();

      const [btn, id, paymentId] = query.data.split('&');
      if(btn !== 'confirm' && btn !== 'reject') return next();

      const status = await this.db.changePaymentStatus(text, btn, +id, paymentId);
      let isSuccess = true;
      if(status === 'Підтверджено') isSuccess = await this.payment.confirmPayment(ctx, text, id, paymentId);
      if(isSuccess) {
         try {
            entities[entities.length - 1].length = status.length;
            // await ctx.editMessageText(text.replace('Очікує перевірки', status), { entities });
         } catch(err) {
            console.error(err);
         }
      }
   }
}