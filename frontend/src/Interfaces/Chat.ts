export interface Chat {
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
    content:string;
    chat:string;
    sender: {
      _id: string;
      name: string;
      email: string;
      pic: string;
    };
  };
}
