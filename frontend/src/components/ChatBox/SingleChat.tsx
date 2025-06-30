import { Fragment } from "react/jsx-runtime";
import { ChatState } from "../../context/ChatProvider";
import { Box, Spinner, Text, Icon, Input } from "@chakra-ui/react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { getSender, getSenderFull } from "../../handlers/ChatLogics";
import ProfileModal from "../Navbar/ProfileModal";
import { FaEye } from "react-icons/fa";
import { useEffect, useState } from "react";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import axios from "axios";
import { toaster } from "../ui/toaster";
import "../../SingleChat.css";
import ScrollableChat from "./ScrollableChat";
import io, { Socket } from "socket.io-client";
import Lottie from "react-lottie";
import { ChatsAndNotifications } from "../../Interfaces/ChatsAndNotification";
import { Message } from "../../Interfaces/Message";
import animationData from "../../Animations/typing.json";
import { BASE_API_URL } from "../../handlers/api";



interface SingleChat {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}
const ENDPOINT: string =
  import.meta.env.VITE_ENV === "production"
    ? "" : "http://localhost:5000";

let socket: Socket;
let selectedChatCompare: ChatsAndNotifications | null;

const SingleChat = ({ fetchAgain, setFetchAgain }: SingleChat) => {
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [openProfile, setOpenProfile] = useState<boolean>(false);
  const [openGroupModal, setOpenGroupModal] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  // const [sentMessageLoading,setSentMessageLoading] = useState<boolean>(false)
  // console.log(isTyping, "IsTYping In Front end");
  // console.log(messages, "All Messages");
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const typingHanlder = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socketConnected) {
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat?._id);
    }
  };

  const fetchAllMessages = async () => {
    if (!selectedChat) {
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      setLoading(true);

      const { data } = await axios.get(
        `${BASE_API_URL}/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id, user?._id);
    } catch (error) {
      toaster.create({
        title: "Failed to Load Messages",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("stop typing", selectedChat?._id);
    if (newMessage) {
      setMessages([
        ...messages,
        {
          _id: "bjbxjqbuq767678687",
          sender: {
            _id: user!._id,
            name: user!.name,
            pic: user!.pic,
          },
          content: newMessage,
          sentMessageloading:true
        },
      ]);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          `${BASE_API_URL}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat?._id,
          },
          config
        );
        // console.log(data, "data from singlechat");
        socket.emit("new message", {...data,sentMessageloading:true});
        // setMessages([...messages, data]);
      } catch (error) {
        toaster.create({
          title: "Failed to Send Message",
          type: "error",
          duration: 5000,
          closable: true,
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    {
      user && socket.emit("setup", user);
    }
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => {
      // console.log("typing in front end");
      if (isTyping) {
        return;
      }
      setIsTyping(true);
    });
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("connected");
      socket.off("typing");
      socket.off("stop typing");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // console.log(socketConnected, "Socket");
    fetchAllMessages();
    selectedChatCompare = selectedChat;

    return () => {
      {
        selectedChat
          ? socket.emit("leaving room", selectedChat._id, user?._id)
          : console.log("selectedChat chat is null");
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    let timeoutId: null | ReturnType<typeof setTimeout> = null;
    const messageHanlder = async ({
      newMessageReceived,
      usersOffline,
    }: {
      newMessageReceived: Message;
      usersOffline: string[];
    }) => {
      // console.log("Inside new message received");
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat?._id
      ) {
        console.log("Inside else loop of message received");
        timeoutId = setTimeout(() => {
          console.log("inside time out");
          setFetchAgain((prev: boolean) => !prev);
        }, 800);
      } else {
        console.log("Inside else statement of sender", usersOffline);
        if (newMessageReceived.sender._id === user?._id) {
          setMessages([...messages.slice(0, -1), {...newMessageReceived,sentMessageloading:false}]);
          if (usersOffline.length === 0) {
            // console.log("users length === 0");
            return;
          }
          // console.log(usersOffline);
          try {
            const config = {
              headers: {
                Authorization: `Bearer ${user?.token}`,
              },
            };

            await axios.post(
              "/api/notification",
              {
                chatId: selectedChat?._id,
                users: usersOffline,
              },
              config
            );
          } catch (error) {
            console.log(error);
          }
          return;
        } else {
          setMessages([...messages, newMessageReceived]);
        }
      }
    };

    socket.on("message received", messageHanlder);
    return () => {
      socket.off("message received", messageHanlder);
      // console.log("Socekt detached");
      if (timeoutId) {
        return clearTimeout(timeoutId);
      }
    };
  }, [messages, selectedChat]);

  useEffect(() => {
    let timeoutId: null | ReturnType<typeof setTimeout> = null;

    if (typing) {
      let lastTypingTime = new Date().getTime();

      timeoutId = setTimeout(() => {
        // console.log("inside set timeout");

        let timeNow = new Date().getTime();
        let timeDifference = timeNow - lastTypingTime;
        if (timeDifference >= 3000 && typing) {
          // console.log("socket emitted");
          socket.emit("stop typing", selectedChat?._id);
          setTyping(false);
        }
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [typing]);

  return (
    <Fragment>
      {selectedChat ? (
        <>
          <Box
            as="div"
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <Icon display={{ base: "flex", md: "none" }}>
              <IoIosArrowRoundBack onClick={() => setSelectedChat(null)} />
            </Icon>
            {!selectedChat.isGroupChat ? (
              <>
                {user && getSender(user, selectedChat.users)}
                <Box
                  display="flex"
                  p={3}
                  height="30px"
                  background="lightgray"
                  justifyContent="center"
                  alignItems="center"
                  _hover={{ opacity: 0.6 }}
                  cursor="pointer"
                  onClick={() => setOpenProfile(true)}
                >
                  <Icon>
                    <FaEye size="25px" />
                  </Icon>
                </Box>
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <Box
                  display="flex"
                  p={3}
                  height="30px"
                  background="lightgray"
                  justifyContent="center"
                  alignItems="center"
                  _hover={{ opacity: 0.6 }}
                  cursor="pointer"
                  onClick={() => setOpenGroupModal(true)}
                >
                  <Icon>
                    <FaEye size="25px" />
                  </Icon>
                </Box>
              </>
            )}
          </Box>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            background="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <form onSubmit={handleFormSubmit}>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                placeholder="Enter a Message"
                variant="outline"
                bg="#E0E0E0"
                onChange={typingHanlder}
                value={newMessage}
              />
            </form>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text
            fontSize="3xl"
            pb={3}
            fontFamily="Work sans"
            data-testid="CLick on user to start chatting"
          >
            Click on a user to start chatting
          </Text>
        </Box>
      )}
      {user && selectedChat?.users && (
        <ProfileModal
          open={openProfile}
          onClose={() => setOpenProfile(false)}
          user={getSenderFull(user, selectedChat.users)}
        />
      )}
      <UpdateGroupChatModal
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
        open={openGroupModal}
        onClose={() => setOpenGroupModal(false)}
      />
    </Fragment>
  );
};

export default SingleChat;
