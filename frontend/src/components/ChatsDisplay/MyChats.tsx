import { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import { toaster } from "../ui/toaster";
import axios from "axios";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { IoIosAdd } from "react-icons/io";
import ChatLoading from "../miscellaneous/SkeletonLoading";
import { getSender } from "../../handlers/ChatLogics";
import GroupChatModal from "./GroupChatModal";
import { User } from "../../Interfaces/User";
import { Notification } from "../../Interfaces/Notification";
import { Chat } from "../../Interfaces/Chat";
import { ChatsAndNotifications } from "../../Interfaces/ChatsAndNotification";

interface MyChats {
  fetchAgain: boolean;
  setFetchAgain: (value: boolean) => void;
}

const MyChats = ({ fetchAgain, setFetchAgain }: MyChats) => {
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [openGroupChatModal, setOpenGroupChatModel] = useState<boolean>(false);
  const [loadingChats, setLoadingChats] = useState<boolean>(true);

  const {
    user,
    selectedChat,
    setSelectedChat,
    chatsAndNotifications,
    setChatsAndNotifications,
  } = ChatState();

  const fetchChats = async ():Promise<Chat[] | []> => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const { data } = await axios.get("/api/chat/", config);

      return data;
    } catch (error) {
      toaster.create({
        title: "Failed to load the Chats",
        type: "error",
        duration: 5000,
        closable: true,
      });
      setLoadingChats(false);
      return [];
    }
  };

  const fetchNotifications = async() : Promise<Notification[] | []> => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/notification/${user?._id}`,
        config
      );
      // console.log(data, "Notifications");
      return data;
    } catch (error) {
      console.log(error);
      toaster.create({
        title: "Failed to Load Notifications",
        type: "warning",
        duration: 5000,
        closable: true,
      });
      setLoadingChats(false);
      return [];
    }
  };

  const fetchChatsAndNotification = async () => {
    const [chats, notifications]: [Chat[] | [], Notification[] | []] =
      await Promise.all([fetchChats(), fetchNotifications()]);
    // console.log(chats, "Chats For particular user");
    // console.log(notifications, "Notifications of that user");

    const allChatsAndNotification: ChatsAndNotifications[] | [] = chats.map(
      (chat) => {
        const notification = notifications.find(
          (notif) => notif.chatId.toString() === chat._id.toString()
        );

        const userObject = notification?.usersOffline.find(
          (obj) => obj.userId.toString() === user?._id.toString()
        );

        return {
          ...chat,
          noOfUnreadMessages: userObject?.count,
        };
      }
    );

    setChatsAndNotifications(allChatsAndNotification);
    setLoadingChats(false);
  };

  // console.log(chatsAndNotifications, "Chats and Notifications");

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    const userInfo = storedUser ? JSON.parse(storedUser) : null;
    setLoggedUser(userInfo);
  }, []);

  useEffect(() => {
    fetchChatsAndNotification();
  }, [fetchAgain]);

  // console.log(chatsAndNotifications, "Cats NAd Notifications");

  const handleSelectChatAndRemoveNotification = async (
    chat: ChatsAndNotifications
  ) => {
    if (selectedChat?._id === chat._id) {
      return;
    }
    setSelectedChat(chat);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      await axios.put(
        "/api/notification/removeNotification",
        {
          chatId: chat._id,
          userId: user?._id,
        },
        config
      );
      setFetchAgain(!fetchAgain);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
      >
        My Chats
        <Button
          onClick={() => setOpenGroupChatModel(true)}
          display="flex"
          bg="lightblue"
          fontSize={{ base: "17px", md: "10px", lg: "17px" }}
          _hover={{ background: "darkblue" }}
        >
          New Group Chat
          <IoIosAdd />
        </Button>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {loadingChats ? (
          <ChatLoading />
        ) : chatsAndNotifications.length > 0 ? (
          <Stack overflowY="scroll">
            {chatsAndNotifications.map((chat) => {
              return (
                <Box
                  onClick={() => handleSelectChatAndRemoveNotification(chat)}
                  cursor="pointer"
                  bg={selectedChat?._id === chat._id ? "#38B2AC" : "#E8E8E8"}
                  color={selectedChat?._id === chat._id ? "white" : "black"}
                  _hover={{ opacity: 0.7 }}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Text>
                      {!chat.isGroupChat
                        ? loggedUser
                          ? getSender(loggedUser, chat.users)
                          : ""
                        : chat.chatName}
                    </Text>
                    {chat.noOfUnreadMessages && (
                      <Text fontSize="12px" fontWeight="bold">
                        {chat.latestMessage.sender.name} :{" "}
                        {chat.latestMessage.content}
                      </Text>
                    )}
                  </Box>
                  {chat.noOfUnreadMessages && (
                    <Text
                      bg="green.500"
                      color="white"
                      fontSize="xs"
                      fontWeight="bold"
                      borderRadius="full"
                      display="inline-block"
                      minW="20px"
                      textAlign="center"
                    >
                      {chat.noOfUnreadMessages}
                    </Text>
                  )}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Text>No Chats To Display</Text>
        )}
      </Box>
      <GroupChatModal
        open={openGroupChatModal}
        onClose={() => setOpenGroupChatModel(false)}
      />
    </Box>
  );
};

export default MyChats;
