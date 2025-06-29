export interface ChatsAndNotifications {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: {
    _id: string;
    name: string;
    email: string;
    pic: string;
  }[];
  groupAdmin?: {
    _id: string;
    name: string;
    email: string;
    pic: string;
  };
  latestMessage: {
    _id: string;
    chat: string;
    content: string;
    sender: {
      _id: string;
      name: string;
      email: string;
      pic: string;
    };
  };
  noOfUnreadMessages?:number
}
