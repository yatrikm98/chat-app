import { ChatState } from "../context/ChatProvider";
import { Box } from "@chakra-ui/react";
import Navbar from "../components/Navbar/Navbar";
import MyChats from "../components/ChatsDisplay/MyChats";
import ChatBox from "../components/ChatBox/ChatBox";
import { useState } from "react";

const ChatPage = () => {
  const { user } = ChatState();

  const [fetchAgain, setFetchAgain] = useState<boolean>(false) 

  return (
    <div style={{ width: "100%" }}>
      {user && <Navbar fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
        {user && (
          <ChatBox
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
