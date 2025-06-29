export interface Message {
  sender: {
    _id: string;
    name: string;
    pic: string;
  };
  content: string;
  chat: {
    _id: string;
    chatName: string;
    isGroupChat: boolean;
    users: {
        _id: string;
        name: string;
        email: string;
        pic: string;
      }[];
    latestMessage: string;
  };
  _id: string;
}