import {
  Button,
  CloseButton,
  Drawer,
  Portal,
  Box,
  Input,
  Spinner
} from "@chakra-ui/react";
import { useState } from "react";
import { toaster } from "../ui/toaster";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";
import UsersLoading from "../miscellaneous/SkeletonLoading";
import UserListItem from "../miscellaneous/UserListItem";
import {User} from '../../Interfaces/User'

interface SearchUserDrawer {
  open: boolean;
  onClose: () => void;
}



const SearchUserDrawer = ({ open, onClose }: SearchUserDrawer) => {
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);

  const { user, setSelectedChat,chatsAndNotifications, setChatsAndNotifications } = ChatState();

  const handleSearch = async () => {
    if (!search) {
      toaster.create({
        title: "Please Enter Something in Search",
        type: "warning",
        duration: 5000,
        closable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResults(data);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Failed to Load Search Results",
        type: "error",
        duration: 5000,
        closable: true,
      });
      return;
    }
  };

  const accessChat = async (userId: string) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);
      // console.log(data)
      if(!chatsAndNotifications.find((c)=>c._id === data._id)){
        console.log("If chat found")
        setChatsAndNotifications([data,...chatsAndNotifications])
      }

      setSelectedChat(data);
      setLoadingChat(false);
      onClose()
    } catch (error) {
      console.log(error)
      toaster.create({
        title: "Error fetching Chats",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={() => onClose()}
      key="start"
      placement="start"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Search User</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Box display="flex" pb="2">
                <Input
                  placeholder="Search By Name or Email"
                  mr="2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={handleSearch}>Go</Button>
              </Box>

              {loading ? (
                <UsersLoading />
              ) : (
                searchResults?.map((user) => {
                  return (
                    <UserListItem
                      user={user}
                      key={user._id}
                      handleFunction={() => accessChat(user._id)}
                    />
                  );
                })
              )}
                {loadingChat && <Spinner ml="auto" display="flex"/> }
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default SearchUserDrawer;
