import { Injectable } from '@nestjs/common';
import axios from 'axios';


interface ICheckMember {
   status: boolean;
}

interface IInviteUrl {
   inviteUrl: string;
}

@Injectable()
export class DiscordService {
   async checkCommunityMember(discordId: string) {
      try {
         const { data } = await axios.get<ICheckMember>('https://2wtdfk5n-3001.euw.devtunnels.ms/bot/community-member', {
            params: { id: discordId }
         });
         return data;
      } catch(err) {
         console.log(err);
      }
   }

   async getInviteUrl() {
      try {
         const { data } = await axios.get<IInviteUrl>('https://2wtdfk5n-3001.euw.devtunnels.ms/bot/get-invite');
         return data;
      } catch(err) {
         console.log(err);
      }
   }

   async checkStudyMember(discordId: string) {
      try {
         const { data } = await axios.get<ICheckMember>('https://2wtdfk5n-3001.euw.devtunnels.ms/bot/study-member', {
            params: { id: discordId }
         });
         return data;
      } catch(err) {
         console.log(err);
      }
   }
}
