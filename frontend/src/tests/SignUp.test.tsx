import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import SignUp from "../components/Authentication/SignUp";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { toaster } from "../components/ui/toaster";
import { cleanup } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";

jest.mock("../components/ui/toaster", () => ({
  toaster: {
    create: jest.fn(),
  },
}));

const handlers = [
  http.post("/api/user", async ({ request }) => {
    const { name, email, password } = (await request.json()) as {
      email: string;
      password: string;
      name: string;
    };
    if (
      name === "Hello" &&
      email !== "ramanbhalla@gmail.com" &&
      password === "123456"
    ) {
      return HttpResponse.json({
        _id: "123",
        name: "Test User",
        email: "testuser@email.com",
        pic: "123.png",
        token: "mock-token",
      });
    }

    return HttpResponse.json(
      { message: "Invalid Credentials" },
      { status: 401 } // unauthorized
    );
  }),
  http.post(
    "https://api.cloudinary.com/v1_1/dttfnjfr4/image/upload",
    async ({ request }) => {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file) {
        return HttpResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      return HttpResponse.json({
        url: "https://res.cloudinary.com/dttfnjfr4/image/upload/v123456/avatar.png",
      });
    }
  ),
];

const server = setupServer(...handlers);

beforeEach(() => {
  jest.clearAllMocks();
});
beforeAll(() => server.listen());
afterEach(async () => {
  await cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

describe("Checking SignUp Page", () => {
  test("Checking all inputs and button ", async () => {
    render(<SignUp />);
    const nameInput = screen.getByRole("textbox", {
      name: /Name/i,
    });
    expect(nameInput).toBeInTheDocument();

    const emailInput = screen.getByRole("textbox", {
      name: /Email/i,
    });

    const passwordInput = screen.getByLabelText("Password");

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    const uploadPicInput = screen.getByLabelText("Upload Your Picture");

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(uploadPicInput).toBeInTheDocument();

    await user.click(nameInput);
    await user.keyboard("Yatrik");

    await user.click(emailInput);
    await user.keyboard("yatrikmehta82@gmail.com");

    await user.click(passwordInput);
    await user.keyboard("123456");

    await user.click(confirmPasswordInput);
    await user.keyboard("123456");

    const file = new File(["dummy content"], "avatar.png", {
      type: "image/png",
    });
    await user.click(uploadPicInput);
    await user.upload(uploadPicInput, file);
  },7000);

  test("If either of the fields is empty for user registration", async () => {
    render(<SignUp />);
    const signUpButton = screen.getByRole("button", {
      name: /SignUp/i,
    });

    await user.click(signUpButton);

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Please Fill all the fields",
        type: "warning",
      })
    );

    expect(toaster.create).toHaveBeenCalledTimes(1);
  });

  test("If passwords do not match", async () => {
    render(<SignUp />);
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    const nameInput = screen.getByRole("textbox", {
      name: /name/i,
    });
    expect(nameInput).toBeInTheDocument();

    const emailInput = screen.getByRole("textbox", {
      name: /Email/,
    });

    const signUpButton = screen.getByRole("button", {
      name: /SignUp/i,
    });

    await user.type(nameInput, "Hello");
    await user.type(emailInput, "yatrikmehta82@gmail.com");
    await user.type(passwordInput, "123456");
    await user.type(confirmPasswordInput, "12345");

    await user.click(signUpButton);

    expect(nameInput).toHaveValue("Hello");
    expect(emailInput).toHaveValue("yatrikmehta82@gmail.com");
    expect(passwordInput).toHaveValue("123456");
    expect(confirmPasswordInput).toHaveValue("12345");

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Passwords do not match",
        type: "warning",
      })
    );

    expect(toaster.create).toHaveBeenCalledTimes(1);
  },7000);

  test("Passing all credentials to see register successfull", async () => {
    render(<SignUp />);
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    const nameInput = screen.getByRole("textbox", {
      name: /name/i,
    });
    expect(nameInput).toBeInTheDocument();

    const emailInput = screen.getByRole("textbox", {
      name: /Email/,
    });

    const signUpButton = screen.getByRole("button", {
      name: /SignUp/i,
    });

    await user.type(nameInput, "Hello");
    await user.type(emailInput, "yatrikmehta82@gmail.com");
    await user.type(passwordInput, "123456");
    await user.type(confirmPasswordInput, "123456");

    await user.click(signUpButton);

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Registration Successfull",
        type: "success",
      })
    );

    expect(toaster.create).toHaveBeenCalledTimes(1);
  },7000);

  test("Error Occurred while registration although there are All credentials , Since user is already there", async () => {
    render(<SignUp />);
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    const nameInput = screen.getByRole("textbox", {
      name: /name/i,
    });
    expect(nameInput).toBeInTheDocument();

    const emailInput = screen.getByRole("textbox", {
      name: /Email/,
    });

    const signUpButton = screen.getByRole("button", {
      name: /SignUp/i,
    });

    await user.type(nameInput, "Hello");
    await user.type(emailInput, "ramanbhalla@gmail.com");
    await user.type(passwordInput, "123456");
    await user.type(confirmPasswordInput, "123456");

    await user.click(signUpButton);

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error Occurred",
        description: "Invalid Credentials",
        type: "error",
      })
    );

    expect(toaster.create).toHaveBeenCalledTimes(1);
  },7000);

  test("should show warning if no image selected during upload", async () => {
    render(<SignUp />); // Assuming postDetails is used inside SignUp

    const uploadInput = screen.getByLabelText("Upload Your Picture");

    // Trigger change with undefined
    fireEvent.change(uploadInput, {
      target: { files: undefined },
    });

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Please Select an Image",
        type: "warning",
      })
    );
  },7000);

  test("should upload image and set image URL if valid file is selected", async () => {
    render(<SignUp />);

    const uploadInput = screen.getByLabelText(/upload your picture/i);
    const file = new File(["dummy content"], "avatar.png", {
      type: "image/png",
    });

    await user.upload(uploadInput, file);

    expect(toaster.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Please Select an Image",
      })
    );

    // You may also spy on `setPic` or assert the result if it's displayed
  },7000);

  test("should handle network error during image upload", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {}); // silence log

    render(<SignUp />);

    const uploadInput = screen.getByLabelText(/upload your picture/i);

    const file = new File(["fake image"], "photo.png", {
      type: "image/png",
    });

    server.use(
      http.post(
        "https://api.cloudinary.com/v1_1/dttfnjfr4/image/upload",
        () => {
          return HttpResponse.error();
        }
      )
    );

    await user.upload(uploadInput, file);

    expect(logSpy).toHaveBeenCalledWith(expect.any(Error));
    logSpy.mockRestore();
  },7000);

  test("should not upload or toast for unsupported file type", async () => {
    render(<SignUp />);

    const uploadInput = screen.getByLabelText(/upload your picture/i);

    const file = new File(["not-an-image"], "resume.pdf", {
      type: "application/pdf",
    });

    await user.upload(uploadInput, file);

    // Expect the function to NOT show any toast or log
    expect(toaster.create).not.toHaveBeenCalled();
  },7000);
});
