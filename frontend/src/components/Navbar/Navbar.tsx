import { useState } from "react";
import { Box, Button, Portal, Avatar, Text, Menu } from "@chakra-ui/react";
import { Tooltip } from "../ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FaBell } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import SearchUserDrawer from "./SearchUserDrawer";
import { useHistory } from "react-router-dom";
import { getSender } from "../../handlers/ChatLogics";
import { ChatsAndNotifications } from "../../Interfaces/ChatsAndNotification";
import axios from "axios";
import { useMemo } from "react";
import { BASE_API_URL } from "../../handlers/api";


interface NavBar {
  fetchAgain: boolean;
  setFetchAgain: (value: boolean) => void;
}

const Navbar = ({ fetchAgain, setFetchAgain }: NavBar) => {
  const [isprofile, setIsProfile] = useState<boolean>(false);
  const [openSearchUserDrawer, setOpenSearchUserDrawer] =
    useState<boolean>(false);


  const {
    user,
    setUser,
    setSelectedChat,
    chatsAndNotifications,
    setChatsAndNotifications,
    selectedChat,
  } = ChatState();

  const history = useHistory();

  const logoutHandler = () => {
    localStorage.clear();
    history.push("/");
    setUser(null);
    setSelectedChat(null);
    setChatsAndNotifications([]);
  };

  const chatsHavingNotifications : ChatsAndNotifications[] | [] = useMemo(() => {
    return chatsAndNotifications.filter((chat) => chat.noOfUnreadMessages);
  }, [chatsAndNotifications])

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
        `${BASE_API_URL}/api/notification/removeNotification`,
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
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bg="white"
      w="100%"
      p="5px 10px 5px 10px"
      borderWidth="5px"
    >
      <Tooltip
        showArrow
        content="This is the tooltip content"
        positioning={{ placement: "bottom-end" }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpenSearchUserDrawer(true)}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <Text display={{ base: "none", md: "flex" }} color="black" px="4">
            Search User
          </Text>
        </Button>
      </Tooltip>
      <Text fontSize="2xl" fontFamily="Work sans">
        Talk-A-Tive
      </Text>
      <div>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="notiications icon"
              mr={3}
            >
              <Box position="relative">
                <FaBell />
                {chatsHavingNotifications.length > 0 && (
                  <Box
                    position="absolute"
                    top="-3"
                    right="-4"
                    w="18px"
                    height="18px"
                    bg="red.500"
                    color="white"
                    borderRadius="50%"
                    px={2}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    fontSize="xs"
                  >
                    {chatsHavingNotifications.length}
                  </Box>
                )}
              </Box>
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {chatsHavingNotifications.length === 0 ? (
                  <Menu.Item value={`no new notifications`}>
                    {"No New Messages"}
                  </Menu.Item>
                ) : (
                  chatsHavingNotifications.map((notif) => {
                    return (
                      <Menu.Item
                        value={`new-file-${notif._id}`}
                        key={notif._id}
                        onClick={() =>
                          handleSelectChatAndRemoveNotification(notif)
                        }
                      >
                        {notif.chatName !== "sender"
                          ? `New message in ${notif.chatName}`
                          : `New Message from ${
                              user && getSender(user, notif.users)
                            }`}
                      </Menu.Item>
                    );
                  })
                )}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="ghost" size="sm" aria-label="abc menu">
              <Avatar.Root size="sm" cursor="pointer">
                <Avatar.Fallback name={user?.name} />
                <Avatar.Image src={user?.pic || undefined} />
              </Avatar.Root>
              <IoChevronDown />
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item
                  onSelect={() => setIsProfile(true)}
                  value="new-text"
                  aria-label="profile button"
                >
                  Profile
                </Menu.Item>
                <Menu.Item value="new-file" onClick={logoutHandler}>
                  LogOut
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        <ProfileModal
          open={isprofile}
          onClose={() => setIsProfile(false)}
          user={user}
        />
      </div>

      <SearchUserDrawer
        open={openSearchUserDrawer}
        onClose={() => setOpenSearchUserDrawer(false)}
      />
    </Box>
  );
};

export default Navbar;
