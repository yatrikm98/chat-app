import { Button, Field, Fieldset, Input, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { PasswordInput } from "../ui/password-input";
import { toaster } from "../ui/toaster";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { BASE_API_URL } from "../../handlers/api";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const history = useHistory();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    // console.log("email:", email, "password:", password);
    if (!email || !password) {
      toaster.create({
        title: "Please Fill all the fields",
        type: "warning",
        duration: 5000,
        closable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/user/login`, {
        email,
        password,
      });

      toaster.create({
        title: "Logged In Successfully",
        type: "success",
        duration: 5000,
        closable: true,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
      // return ;
    } catch (error) {
      toaster.create({
        title: "Invalid Credentials",
        type: "error",
        duration: 5000,
        closable: true,
      });

      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <VStack spaceY="5px" spaceX="5px">
        <Fieldset.Root size="lg" maxW="md">
          <Fieldset.Content>
            <Field.Root id="email">
              <Field.Label>Email</Field.Label>
              <Input
                name="email"
                type="email"
                placeholder="Enter Your Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                autoComplete="new-email"
              />
            </Field.Root>

            <Field.Root id="password">
              <Field.Label>Password</Field.Label>
              <PasswordInput
                type="passsword"
                placeholder="Enter Your Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                autoComplete="new-password"
              />
            </Field.Root>
          </Fieldset.Content>
          <Button
            bg="blue"
            color="white"
            type="submit"
            _hover={{ opacity: 0.8 }}
            style={{ marginTop: 15 }}
            loading={loading}
          >
            Login
          </Button>
          <Button
            variant="solid"
            style={{ marginTop: "5px" }}
            w="100%"
            bg="red"
            color="white"
            _hover={{ opacity: 0.8 }}
            onClick={() => {
              setEmail("guest@example.com");
              setPassword("123456");
            }}
          >
            Get Guest User Credentials
          </Button>
        </Fieldset.Root>
      </VStack>
    </form>
  );
};

export default Login;
