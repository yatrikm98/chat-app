import UserListItem from "../miscellaneous/UserListItem";
import UserBadgeItem from "../miscellaneous/UserBadgeItem";
import { useState } from "react";
import { User } from "../../Interfaces/User";
import { ChatState } from "../../context/ChatProvider";
import { toaster } from "../ui/toaster";
import axios from "axios";
import {
  Field,
  Fieldset,
  Input,
  Box,
} from "@chakra-ui/react";

interface InputGroupChatModal {
    selectedUsers:User[]
    handleDelete:(user:User)=>void
    handleAddUser:(user:User)=>void
}


const InputGroupChatModel = ({selectedUsers,handleDelete,handleAddUser}:InputGroupChatModal) => {
  const [search, setSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { user,} = ChatState();

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      // console.log(data, "Group Chat");
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toaster.create({
        title: "Failed to Load Search Results",
        type: "error",
        duration: 5000,
        closable: true,
      });
      setLoading(false);
      return;
    }
  };

  return (
    <Fieldset.Root size="lg" maxW="md">
      <Fieldset.Content>
        <Field.Root>
          <Input
            name="email"
            placeholder="Add Users eg: John , Piyush , Jane"
            mb={1}
            onChange={(e) => handleSearch(e.target.value)}
            value={search}
          />
        </Field.Root>
      </Fieldset.Content>
      <Box w="100%" display="flex" flexWrap="wrap" mt="0">
        {selectedUsers.map((user) => {
          return (
            <UserBadgeItem
              key={user._id}
              user={user}
              handleFunction={() => handleDelete(user)}
            />
          );
        })}
      </Box>
      <div style={{ marginTop: "0px" }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          searchResult &&
          searchResult.slice(0, 4).map((user) => {
            return (
              <UserListItem
                user={user}
                key={user._id}
                handleFunction={() => handleAddUser(user)}
              />
            );
          })
        )}
      </div>
    </Fieldset.Root>
  );
};

export default InputGroupChatModel;
