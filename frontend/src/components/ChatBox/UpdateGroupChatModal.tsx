import {
  Dialog,
  Portal,
  Box,
  Field,
  Fieldset,
  Input,
  Button,
} from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider";
import { useState } from "react";
import { toaster } from "../ui/toaster";
import UserBadgeItem from "../miscellaneous/UserBadgeItem";
import axios from "axios";
import { BASE_API_URL } from "../../handlers/api";
import { User } from "../../Interfaces/User";
import InputUpdateGroupChatModal from "./InputUpdateGroupChatModal";


interface GroupChatModal {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  onClose: () => void;
}

const UpdateGroupChatModal = ({
  fetchAgain,
  setFetchAgain,
  open,
  onClose,
}: GroupChatModal) => {
  const [groupChatName, setGroupCHatName] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [renameLoadingChat, setRenameLoadingChat] = useState<boolean>(false);

  const { selectedChat, setSelectedChat, user } = ChatState();
  // console.log(selectedChat,"Selected CHat")
  const handleRemove = async (userToRemove: User) => {
    if (selectedChat?.groupAdmin?._id !== user?._id) {
      // console.log("Inside If");
      toaster.create({
        title: "Only Admins can Remove someone!",
        type: "error",
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
      const { data } = await axios.put(
        `${BASE_API_URL}/api/chat/groupremove`,
        {
          chatId: selectedChat?._id,
          userId: userToRemove._id,
        },
        config
      );
      // console.log(data,"Data from remove user")

      userToRemove._id === user?._id
        ? setSelectedChat(null)
        : setSelectedChat(data);
      setFetchAgain((prev) => !prev);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Failed to Remove User",
        type: "error",
        duration: 5000,
        closable: true,
      });
      setLoading(false);
      return;
    }
  };

  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }

    try {
      setRenameLoadingChat(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.put(
        `${BASE_API_URL}/api/chat/rename`,
        {
          chatName: groupChatName,
          chatId: selectedChat?._id,
        },
        config
      );
      setSelectedChat(data);
      // console.log(data,"Chat NAme")
      setFetchAgain(!fetchAgain);
      setRenameLoadingChat(false);
    } catch (error) {
      toaster.create({
        title: "Failed to Rename Chat",
        type: "error",
        duration: 5000,
        closable: true,
      });
      setRenameLoadingChat(false);
    }

    setGroupCHatName("");
  };

  

  const handleAddUser = async (userToAdd: User) => {
    if (selectedChat?.users.find((u) => u._id === userToAdd._id)) {
      // console.log("USer already addedd")
      toaster.create({
        title: "User already added",
        type: "error",
        duration: 5000,
        closable: true,
      });
      return;
    }
    if (selectedChat?.groupAdmin?._id !== user?._id) {
      // console.log("Only Admins can add")
      toaster.create({
        title: "Only Admins can add someone!",
        type: "error",
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
      const { data } = await axios.put(
        `${BASE_API_URL}/api/chat/groupadd`,
        {
          chatId: selectedChat?._id,
          userId: userToAdd._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Failed to Add User",
        type: "error",
        duration: 5000,
        closable: true,
      });
      setLoading(false);
      return;
    }
  };

  const handleRemoveYourself = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.put(
        `${BASE_API_URL}/api/chat/groupremove`,
        {
          chatId: selectedChat?._id,
          userId: user?._id,
        },
        config
      );
      console.log(data, "removing Yourself");
      setSelectedChat(null);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Failed to Remove User",
        type: "error",
        duration: 5000,
        closable: true,
      });
      setLoading(false);
      return;
    }
  };

  return (
    <Dialog.Root
      lazyMount
      open={open}
      onOpenChange={() => onClose()}
      placement="center"
      key="lg"
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content minH="300px" maxW="550px">
            <Dialog.Header>
              <Dialog.Title
                fontSize="40px"
                fontFamily="Work sans"
                w="100%"
                display="flex"
                justifyContent="center"
                data-testid="chatname"
              >
                {selectedChat?.chatName}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Box w="100%" display="flex" flexWrap="wrap">
                {selectedChat?.users.map((user) => {
                  return (
                    <UserBadgeItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleRemove(user)}
                    />
                  );
                })}
              </Box>
              <Fieldset.Root size="lg" maxW="md">
                <Fieldset.Content>
                  <Field.Root w="100%">
                    <div
                      style={{ display: "flex", width: "100%", margin: "auto" }}
                    >
                      <Input
                        name="name"
                        placeholder="Chat Name"
                        value={groupChatName}
                        onChange={(e) => setGroupCHatName(e.target.value)}
                        w="70%"
                      />
                      <Button
                        variant="outline"
                        color="teal"
                        ml={1}
                        loading={renameLoadingChat}
                        onClick={handleRename}
                      >
                        Update
                      </Button>
                    </div>
                  </Field.Root>
                </Fieldset.Content>
              </Fieldset.Root>
              <InputUpdateGroupChatModal 
              handleAddUser={(user)=>handleAddUser(user)}
              loading={loading}
              setLoading={(value)=>setLoading(value)}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  color="red"
                  onClick={() => handleRemoveYourself()}
                >
                  Leave Group
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default UpdateGroupChatModal;
