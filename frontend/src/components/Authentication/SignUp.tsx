import {
  Button,
  Field,
  Fieldset,
  Input,
  FileUpload,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { PasswordInput } from "../ui/password-input";
import { HiUpload } from "react-icons/hi";
import { toaster } from "../ui/toaster";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { BASE_API_URL } from "../../handlers/api";


interface ReceivedDataFromCloudinary {
  url: String;
}

const SignUp = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [pic, setPic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const history = useHistory();

  const postDetails = async (pic: File | undefined) => {
    setLoading(true);
    if (pic === undefined) {
      toaster.create({
        title: "Please Select an Image",
        type: "warning",
        duration: 5000,
        closable: true,
      });
      return;
    }

    if (pic.type === "image/jpeg" || pic.type === "image/png") {
      const data = new FormData();
      data.append("file", pic); // file is the image blob or File object
      data.append("upload_preset", "chat-app");
      // data.append("cloud_name","dttfnjfr4")
      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dttfnjfr4/image/upload",
          data
        );
        const receivedResponse: ReceivedDataFromCloudinary = await res.data;
        // console.log(receivedResponse, "Data from cloudinary");
        setPic(receivedResponse.url.toString());
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
      return;
    }
  };

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    // console.log("Isnide Submit Handler")
    event.preventDefault()
    // console.log("Inside handler");
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      toaster.create({
        title: "Please Fill all the fields",
        type: "warning",
        duration: 5000,
        closable: true,
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toaster.create({
        title: "Passwords do not match",
        type: "warning",
        duration: 5000,
        closable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/user`, {
        name,
        email,
        password,
        ...(pic.length > 0 && { pic }),
      });

      toaster.create({
        title: "Registration Successfull",
        type: "success",
        duration: 5000,
        closable: true,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
      ) {
        toaster.create({
          title: "Error Occurred",
          description: error.response.data.message,
          type: "error",
          duration: 5000,
          closable: true,
        });
      }

      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <VStack spaceY="5px" spaceX="5px">
        <Fieldset.Root size="lg" maxW="md">
          <Fieldset.Content>
            <Field.Root id="first-name">
              <Field.Label>Name</Field.Label>
              <Input
                name="name"
                placeholder="Enter Your Name"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </Field.Root>

            <Field.Root id="sign-up-email">
              <Field.Label>Email</Field.Label>
              <Input
                name="email"
                type="email"
                placeholder="Enter Your Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </Field.Root>

            <Field.Root id="sign-up-password">
              <Field.Label>Password</Field.Label>
              <PasswordInput
                type="password"
                placeholder="Enter Your Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                autoComplete="new-password"
              />
            </Field.Root>

            <Field.Root id="confirm-password">
              <Field.Label>Confirm Password</Field.Label>
              <PasswordInput
                type="password"
                placeholder="Enter Your Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                autoComplete="new-password"
              />
            </Field.Root>

            <Field.Root id="pic">
              <Field.Label>Upload Your Picture</Field.Label>
              <FileUpload.Root maxFiles={1}>
                <FileUpload.HiddenInput
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    postDetails(e.target.files?.[0])
                  }
                />
                <FileUpload.Trigger asChild>
                  <Button variant="outline" size="sm">
                    <HiUpload /> Upload file
                  </Button>
                </FileUpload.Trigger>
                <FileUpload.List showSize clearable />
              </FileUpload.Root>
            </Field.Root>
          </Fieldset.Content>
          <Button
            bg="blue"
            type="submit"
            color="white"
            _hover={{ opacity: 0.8 }}
            style={{ marginTop: 15 }}
            loading={loading}
          >
            SignUp
          </Button>
        </Fieldset.Root>
      </VStack>
    </form>
  );
};

export default SignUp;
