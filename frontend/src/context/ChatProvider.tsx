import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { User } from "../Interfaces/User";
import { ChatsAndNotifications } from "../Interfaces/ChatsAndNotification";


const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

interface ChatContextType {
  user: null | User;
  selectedChat: ChatsAndNotifications | null;
  setUser: React.Dispatch<React.SetStateAction<null | User>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatsAndNotifications | null>>;
  chatsAndNotifications:ChatsAndNotifications[] | []
  setChatsAndNotifications:React.Dispatch<React.SetStateAction<ChatsAndNotifications[] | []>>;
}

function ChatProvider({ children }: ChatProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatsAndNotifications | null>(null);
  const [chatsAndNotifications, setChatsAndNotifications] = useState<ChatsAndNotifications[]>([]);

  const location = useLocation();
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    const userInfo = storedUser ? JSON.parse(storedUser) : null;
    if (!userInfo) return;
    setUser(userInfo);


    return ()=>{
      localStorage.clear()
    }
  }, [location]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chatsAndNotifications,
        setChatsAndNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const ChatState = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("ChatState must be used within a ChatProvider");
  }
  return context;
};

export default ChatContext;
export { ChatProvider };
