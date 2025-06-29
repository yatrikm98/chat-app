import { Container,Box,Text,Tabs } from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import SignUp from "../components/Authentication/SignUp";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";

const HomePage = () => {
  const history = useHistory();

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (user) {
      history.push("/chats");
    }
  }, [history]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        bg="white"
        w="100%"
        p={3}
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work Sans" color="black">
          Talk-A-Tive
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs.Root defaultValue="members" variant="plain">
          <Tabs.List bg="bg.muted" rounded="l3" p="1" w="100%" mb="1em">
            <Tabs.Trigger
              value="members"
              display="flex"
              justifyContent="center"
              w="50%"
            >
              Login
            </Tabs.Trigger>
            <Tabs.Trigger
              value="projects"
              display="flex"
              justifyContent="center"
              w="50%"
            >
              SignUp
            </Tabs.Trigger>
            <Tabs.Indicator rounded="l2" />
          </Tabs.List>
          <Tabs.Content value="members">
            <Login />
          </Tabs.Content>
          <Tabs.Content value="projects">
            <SignUp />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Container>
  );
};

export default HomePage;