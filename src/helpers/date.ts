export const formatDate = (timestamp: number): string => {
   const date = new Date(timestamp);
   const day = `${date.getDate()}`.padStart(2, '0');
   const month = `${date.getMonth() + 1}`.padStart(2, '0');
   const year = date.getFullYear();
   return `${day}-${month}-${year}`;
}

export const subscriptionDate = (date: number, months: number) => {
   const now = new Date();
   const subscriptionEnd = new Date(date);
   const subscription = subscriptionEnd > now ? subscriptionEnd : now;
   const endDate = new Date(subscription.setMonth(subscription.getMonth() + months));
   return endDate.getTime();
}