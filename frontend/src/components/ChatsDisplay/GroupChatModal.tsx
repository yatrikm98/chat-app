import {
  CloseButton,
  Dialog,
  Portal,
  Button,
  Field,
  Fieldset,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import { toaster } from "../ui/toaster";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";
import { User } from "../../Interfaces/User";
import InputGroupChatModel from "./InputGroupChatModel";

interface GroupChatModal {
  open: boolean;
  onClose: () => void;
}

const GroupChatModal = ({ open, onClose }: GroupChatModal) => {
  const [groupChatName, setGroupCHatName] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { user, chatsAndNotifications, setChatsAndNotifications } = ChatState();

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toaster.create({
        title: "Please fill all the fields",
        type: "warning",
        duration: 5000,
        closable: true,
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChatsAndNotifications([data, ...chatsAndNotifications]);
      onClose();
      toaster.create({
        title: "New Group Chat created",
        type: "success",
        duration: 5000,
        closable: true,
      });
    } catch (error) {
      toaster.create({
        title: "Failed to create Chat",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  const handleAddUser = (userToAdd: User) => {
    if (selectedUsers.includes(userToAdd)) {
      toaster.create({
        title: "User already added",
        type: "warning",
        duration: 5000,
        closable: true,
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (user: User) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== user._id));
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
          <Dialog.Content minH="300px">
            <Dialog.Header>
              <Dialog.Title
                fontSize="35px"
                fontFamily="Work sans"
                w="100%"
                display="flex"
                justifyContent="center"
              >
                Create Group Chat
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body
              display="flex"
              flexDir="column"
              alignItems="center"
              gap="4"
            >
              <Fieldset.Root size="lg" maxW="md">
                <Fieldset.Content>
                  <Field.Root>
                    <Input
                      name="name"
                      placeholder="Chat Name"
                      value={groupChatName}
                      onChange={(e) => setGroupCHatName(e.target.value)}
                    />
                  </Field.Root>
                </Fieldset.Content>
              </Fieldset.Root>
              <InputGroupChatModel
                selectedUsers={selectedUsers}
                handleDelete={(user) => handleDelete(user)}
                handleAddUser={(user) => handleAddUser(user)}
              />
              <Button color="white"bg="blue" variant="outline" w="auto" onClick={handleSubmit} ml="auto" _hover={{opacity:0.8}}>
                Create Chat
              </Button>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default GroupChatModal;
