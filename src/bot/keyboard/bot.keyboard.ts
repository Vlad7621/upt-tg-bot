import { Markup } from 'telegraf';
import { buttons } from './bot.buttons';

const url = 'https://2wtdfk5n-3000.euw.devtunnels.ms';

export const keyboard = {
   menu: Markup.keyboard([
      [buttons.menu.study],
      [buttons.menu.privateChannel],
      [buttons.menu.myProfile],
      [buttons.menu.feedback],
      [buttons.menu.links]
   ]).resize(true),
   study: Markup.inlineKeyboard([
      [Markup.button.webApp(buttons.study.detailedInformation, `${url}/study`)],
      [Markup.button.callback(buttons.study.downloadFile, 'UPTEDUCATIONPRESENTATION')],
      [Markup.button.url(buttons.study.FAQ, 'https://t.me/uptquestionseducation')]
   ]),
   privateChannel: Markup.inlineKeyboard([
      [Markup.button.webApp(buttons.privateChannel.detailedInformation, `${url}/private-community`)],
      [Markup.button.callback(buttons.privateChannel.downloadFile, 'UPTPRIVATEPRESENTATION')]
   ]),
   myProfile: Markup.inlineKeyboard([
      [Markup.button.webApp(buttons.myProfile.detailedInformation, `${url}/profile`)],
      [Markup.button.callback(buttons.myProfile.getSubscription, 'get-subscription')],
   ]),
   auth: Markup.inlineKeyboard([
      [Markup.button.webApp(buttons.auth.loginWithDiscord, `${url}/auth?type=community`)]
   ])
}