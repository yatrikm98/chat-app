import { Spinner } from "@chakra-ui/react";
import UserListItem from "../miscellaneous/UserListItem";
import {
  Field,
  Fieldset,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import { User } from "../../Interfaces/User";
import { ChatState } from "../../context/ChatProvider";
import axios from 'axios'
import { toaster } from "../ui/toaster";
import { BASE_API_URL } from "../../handlers/api";



interface  InputUpdateGroupChatModal {
    handleAddUser:(user:User)=>void
    loading:boolean
    setLoading:(value:boolean)=>void
}



const InputUpdateGroupChatModal = ({handleAddUser,loading,setLoading}:InputUpdateGroupChatModal) => {
  const [search, setSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<User[]>([]);

  const { user } = ChatState();

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
      const { data } = await axios.get(`${BASE_API_URL}/api/user?search=${query}`, config);
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
    <>
      <Fieldset.Root size="lg" maxW="md">
        <Fieldset.Content>
          <Field.Root w="100%">
            <Input
              name="name"
              placeholder="Add Users"
              onChange={(e) => handleSearch(e.target.value)}
              value={search}
            />
          </Field.Root>
        </Fieldset.Content>
      </Fieldset.Root>
      {loading ? (
        <Spinner size="lg" />
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
    </>
  );
};

export default InputUpdateGroupChatModal;
