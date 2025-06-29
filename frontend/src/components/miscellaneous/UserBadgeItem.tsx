import { Box } from "@chakra-ui/react";
import { IoIosClose } from "react-icons/io";
import {User} from '../../Interfaces/User'



interface UserBadgeItem {
  user: User;
  handleFunction: () => void;
}

const UserBadgeItem = ({ user, handleFunction }: UserBadgeItem) => {
  return (
    <Box
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      fontSize="12"
      color="white"
      bg="purple"
      cursor="pointer"
      onClick={handleFunction}
      display="flex"
      alignItems="center"
      data-testid={`search-results-box-${user?.name}`}
    >
      {user.name}
      <IoIosClose style={{ paddingLeft: "1px" }} />
    </Box>
  );
};

export default UserBadgeItem;
