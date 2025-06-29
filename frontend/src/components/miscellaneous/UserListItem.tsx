import { Box,Avatar, Text } from "@chakra-ui/react";
import {User} from '../../Interfaces/User'




interface UserDisplay {
  user: User;
  handleFunction: () => void;
}

const UserListItem = ({ user, handleFunction }: UserDisplay) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
      data-testid={`search-results-box-${user._id}`}
      
    >
      <Avatar.Root size="sm" cursor="pointer">
        <Avatar.Fallback name={user.name} />
        <Avatar.Image src={user.pic || undefined} />
      </Avatar.Root>

      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs" ><b>{user.email}</b></Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
