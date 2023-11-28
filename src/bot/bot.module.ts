import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { BotController } from './bot.controller';
import { TelegrafModule } from 'nestjs-telegraf';
import { DatabaseService } from 'src/database/database.service';
import { DatabaseModule } from 'src/database/database.module';
import { DiscordService } from './bot.discord';
import { PaymentService } from './bot.payment';


@Module({
   imports: [
      TelegrafModule.forRoot({
         token: '6022251231:AAGkvfD67xsU8ZeTaHmkbxA9kzMd7iVqkj8',
         launchOptions: {
            dropPendingUpdates: true
         }
      }),
      DatabaseModule
   ],
   controllers: [BotController],
   providers: [BotUpdate, DatabaseService, PaymentService, DiscordService]
})
export class BotModule {}
