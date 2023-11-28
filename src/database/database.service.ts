import { Injectable } from '@nestjs/common';
import { formatDate, subscriptionDate } from 'src/helpers/date';
import { getDatabase } from 'firebase-admin/database';


interface IUser {
   email?: string;
   phone?: string; 
   discordId?: string;
   subscription?: number | 'indefinite';
   сreationDate: number;
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

@Injectable()
export class DatabaseService {
   constructor() {}

   private readonly db = getDatabase();

   async auth(id: number) {
      const data = await this.db.ref(`Users/${id}`).once('value');
      const user: IUser | null = data.val(); 
      if(user) return true;

      const сreationDate = new Date().getTime();
      const updates: IUser = { сreationDate };
      await this.db.ref(`Users/${id}`).update(updates);
      return false;
   }

   async getUser(id: number) {
      const data = await this.db.ref(`Users/${id}`).once('value');
      const user: IUser | null = data.val();
      return user;
   }

   async isPhone(id: number) {
      const data = await this.db.ref(`Users/${id}/phone`).once('value');
      const phone: string | null = data.val();
      return !!phone;
   }

   async addPhone(id: number, phone: string) {
      const updates: { phone: string } = { phone };
      await this.db.ref(`Users/${id}`).update(updates);
   }

   async addDisocrd(id: number, email: string, discordId: number) {
      const updates: { email: string, discordId: number } = { email, discordId };
      await this.db.ref(`Users/${id}`).update(updates);
   }

   async getDiscord(id: number) {
      const data = await this.db.ref(`Users/${id}/discordId`).once('value');
      const discordId: string | null = data.val();
      return discordId;
   }

   async getProfile(id: number) {
      const data = await this.db.ref(`Users/${id}`).once('value');
      const user: IUser | null = data.val(); 
      const { subscription } = user;
      
      let subscriptionInfo: string;
      if(subscription === 'indefinite') {
         subscriptionInfo = 'Безстрокова';
      }
      else {
         const currentDate = new Date().getTime();
         subscriptionInfo = subscription > currentDate ? `Дійсна до ${formatDate(subscription)}` : 'Немає';
      }
      return `<b>Підписка:</b> <i>${subscriptionInfo}</i>`;
   }

   async createPayment(id: number, paymentId: string, tariff: string, way: string,  price: string) {
      const timestamp = new Date().getTime();
      const updates: IPayment = {
         tariff,
         way,
         price: +price,
         user: id,
         timestamp
      }
      await this.db.ref(`Payments/${paymentId}`).update(updates);
   }

   async changePaymentStatus(text: string, btn: string, id: number, paymentId: string) {
      const updates = {};
      const match = text.match(/\((\d+) місяц/i);
      const month = match ? parseInt(match[1]) : null;
      const status = btn === 'confirm' ? 'Підтверджено' : 'Відхилено';
      if(text.includes('Безстрокова') && status === 'Підтверджено') {
         updates[`Users/${id}/subscription`] = 'indefinite';
      }
      if(month && status === 'Підтверджено') {
         const data = await this.db.ref(`Users/${id}/subscription`).once('value');
         const subscription = data.val() || new Date().getTime();
         updates[`Users/${id}/subscription`] = subscriptionDate(subscription, month);
      }
      updates[`Payments/${paymentId}/status`] = status;
      await this.db.ref().update(updates);
      return status;
   }

   async getPayments(id: number) {
      const data = await this.db.ref('Payments').orderByChild('user').equalTo(id).once('value');
      const payments: IPayments | null = data.val();
      return payments;
   }

}
