import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { DatabaseModule } from './database/database.module';


@Module({
   imports: [
      BotModule,
      DatabaseModule
   ]
})

export class AppModule {}
