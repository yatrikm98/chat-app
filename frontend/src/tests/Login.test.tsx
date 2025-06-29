import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import Login from "../components/Authentication/Login";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { toaster } from "../components/ui/toaster";
import { cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("../components/ui/toaster", () => ({
  toaster: {
    create: jest.fn(),
  },
}));

const handlers = [
  http.post("/api/user/login", async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    console.log(email, password);
    if (email === "yatrikmehta82@gmail.com" && password === "123456") {
      return HttpResponse.json({
        _id: "123",
        name: "Test User",
        email: "testuser@email.com",
        pic: "123.png",
        token: "mock-token",
      });
    }
    return HttpResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }),
];

const server = setupServer(...handlers);

beforeEach(() => {
  jest.clearAllMocks();
  // server.listen()
});
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  // server.close()
  cleanup();
});
afterAll(() => server.close());

describe("Tests for login", () => {
  test("Checking whether components exists or not ", async () => {
    render(<MemoryRouter><Login /></MemoryRouter> );

    const emailInput = screen.getByRole("textbox", {
      name: /email/i,
    });

    const passwordInput = screen.getByLabelText("Password");

    const loginButton = screen.getByRole("button", {
      name: /Login/i,
    });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    await user.type(emailInput, "yatrikmehta82@gmail.com");
    await user.type(passwordInput, "123456");

    expect(emailInput).toHaveValue("yatrikmehta82@gmail.com");
    expect(passwordInput).toHaveValue("123456");

    await user.click(loginButton);

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Logged In Successfully",
        type: "success",
        duration: 5000,
        closable: true,
      })
    );


    expect(toaster.create).toHaveBeenCalledTimes(1);
    // expect(localStorage.getItem("userInfo")).toContain("testuser@email.com");
  });

  test("When credentials are missing", async () => {
    render(<Login />);

    const loginButton = screen.getByRole("button", {
      name: /Login/i,
    });

    await user.click(loginButton);

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Please Fill all the fields",
        type: "warning",
      })
    );
    expect(toaster.create).toHaveBeenCalledTimes(1);
  });

  test("When credetials are wrong", async () => {
    render(<Login />);

    const emailInput = screen.getByRole("textbox", { name: /Email/i });
    const passwordInput = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: /Login/i });

    await user.type(emailInput, "wrong@gmail.com");
    await user.type(passwordInput, "wrong");

    await user.click(loginButton);
      // screen.logTestingPlaygroundURL()
    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Invalid Credentials",
        type: "error",
        duration: 5000,
        closable: true,
      })
    );
    expect(toaster.create).toHaveBeenCalledTimes(1);
  });

  test("When user clicks Get Credentials", async () => {
    render(<Login />);
    const emailInput = screen.getByRole("textbox", { name: /Email/i });
    const passwordInput = screen.getByLabelText("Password");
    const getUSerButton = screen.getByRole("button", {
      name: /Get Guest User Credentials/i,
    });

    await user.click(getUSerButton);

    expect(emailInput).toHaveValue("guest@example.com");
    expect(passwordInput).toHaveValue("123456");
  });
});
