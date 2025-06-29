export interface Notification {
  _id:string;
  chatId:string;
  usersOffline:{
    userId:string;
    count:number;
    _id:string
  }[]
}