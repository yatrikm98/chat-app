import SearchUserDrawer from "../components/Navbar/SearchUserDrawer";
import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import { toaster } from "../components/ui/toaster";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import UserListItem from "../components/miscellaneous/UserListItem";

const mockUser = {
  name: "Test User",
  pic: "test.png",
  email: "test@example.com",
  _id: "123",
  token: "token123",
};

const mockSetSelectedChat = jest.fn();
const mockSetChatsAndNotifications = jest.fn();


jest.mock("../context/ChatProvider", () => ({
  ChatState: () => ({
    user: mockUser,
    chats: [],
    chatsAndNotifications: [
      {
        _id: "123",
        chatName: "Yatrik",
        isGroupChat: true,
        noOfUnreadMessages: 2,
        latestMessage: {
          content: "hello",
          sender: {
            name: "YAtrik",
          },
        },
      },
    ],
    setChatsAndNotifications: mockSetChatsAndNotifications,
    setSelectedChat:mockSetSelectedChat
  }),
}));

jest.mock("../components/ui/toaster", () => ({
  toaster: {
    create: jest.fn(),
  },
}));

jest.mock("@chakra-ui/react", () => {
  const actualChakra = jest.requireActual("@chakra-ui/react");

  return {
    ...actualChakra,

    Button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props} style={{ pointerEvents: "auto" }}>
        {children}
      </button>
    ),

    Input: ({ value, onChange, placeholder, ...props }: any) => (
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
        style={{ pointerEvents: "auto" }}
      />
    ),

    Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,

    Spinner: (props: any) => (
      <div role="status" {...props}>
        Loading...
      </div>
    ),

    CloseButton: ({ ...props }: any) => (
      <button aria-label="close-button" {...props}>
        ×
      </button>
    ),

    Portal: ({ children }: any) => <>{children}</>,

    Drawer: {
      Root: ({ open, children }: any) => (open ? <div>{children}</div> : null),
      Backdrop: () => <div data-testid="drawer-backdrop" />,
      Positioner: ({ children }: any) => <div>{children}</div>,
      Content: ({ children }: any) => <div>{children}</div>,
      Header: ({ children }: any) => <div>{children}</div>,
      Title: ({ children }: any) => <h2>{children}</h2>,
      Body: ({ children }: any) => <div>{children}</div>,
      CloseTrigger: ({ children }: any) => <>{children}</>,
    },
    Avatar: {
      Root: ({ children, ...props }: any) => (
        <div data-testid="avatar-root" {...props}>
          {children}
        </div>
      ),
      Fallback: ({ name }: any) => (
        <div data-testid="avatar-fallback">{name?.slice(0, 2)}</div>
      ),
      Image: ({ src, ...props }: any) => (
        <img data-testid="avatar-image" src={src} alt="avatar" {...props} />
      ),
    },
  };
});

const handlers = [
  http.get(`/api/user`, async ({ request }) => {
    const url = new URL(request.url);
    const searchParam = url.searchParams.get("search");

    if (searchParam !== "" && searchParam !== "abc") {
      return HttpResponse.json([
        {
          _id: "123",
          name: "Test User",
          email: "testuser@email.com",
          pic: "123.png",
        },
        {
          _id: "124",
          name: "Yatrik Mehta",
          email: "yatrikmehta82@gmail.com",
          pic: "1231.png",
        },
      ]);
    }
    return HttpResponse.json(
      { message: "please enter something" },
      { status: 401 }
    );
  }),
  http.post(`/api/chat`, async ({ request }) => {
    const { userId } = (await request.json()) as {
      userId: string;
    };

    if (userId) {
      return HttpResponse.json({
        _id: "68506e30e557a0e74d65439f",
        chatName: "sender",
        isGroupChat: false,
        users: [
          {
            _id: "685046936b171d3f9c5395a3",
            name: "John Doe",
            email: "johndoe@gmail.com",
            pic: "http://res.cloudinary.com/dttfnjfr4/image/upload/v1750091396/Screenshot_2025-06-16_at_5.38.06_PM_acae2g.png",
          },
          {
            _id: "68504a236b171d3f9c5395a6",
            name: "ronak",
            email: "ronak@gmail.com",
            pic: "",
          },
        ],
      });
    }
    return HttpResponse.json(
      { message: "please enter something" },
      { status: 401 }
    );
  }),
];

const server = setupServer(...handlers);

beforeEach(() => {
  jest.clearAllMocks();
});
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

describe("Checking Search UserDrawer Component", () => {
  describe("Cheking Search Api ", () => {
    test("Giving an empty input ", async () => {
      render(<SearchUserDrawer open onClose={() => {}} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();

      const button = screen.getByRole("button", {
        name: /Go/i,
      });

      await user.click(button);

      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Please Enter Something in Search",
          type: "warning",
        })
      );
    });

    test("Entering Something in Input", async () => {
      render(<SearchUserDrawer open onClose={() => {}} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();

      const button = screen.getByRole("button", {
        name: /Go/i,
      });

      await user.click(input);
      await user.keyboard("r");
      expect(input).toHaveValue("r");

      await user.click(button);
      // screen.logTestingPlaygroundURL();

      const text = screen.getByText("Test User");
      const email = screen.getByText("testuser@email.com");
      expect(text).toBeInTheDocument();
      expect(email).toBeInTheDocument();
    });

    test("Although providing search Term , we get errors", async () => {
      render(<SearchUserDrawer open onClose={() => {}} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();

      const button = screen.getByRole("button", {
        name: /Go/i,
      });

      await user.click(input);
      await user.keyboard("abc");
      expect(input).toHaveValue("abc");

      await user.click(button);
      // screen.logTestingPlaygroundURL()
      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to Load Search Results",
          type: "error",
        })
      );
    });
  });

  test("Testing hanlder function of user list being called", async () => {
    const user1 = {
      _id: "123",
      name: "Test User",
      email: "testuser@email.com",
      pic: "123.png",
    };

    const handleFunction = jest.fn();
    render(<UserListItem user={user1} handleFunction={handleFunction} />);

    const text = screen.getByText("Test User");
    const email = screen.getByText("testuser@email.com");
    expect(text).toBeInTheDocument();
    expect(email).toBeInTheDocument();

    const userBox = screen.getByText("Test User").closest("div");
    expect(userBox).toBeInTheDocument();

    if (userBox) {
      await user.click(userBox);
    }

    expect(handleFunction).toHaveBeenCalled();
    // screen.logTestingPlaygroundURL();;
  });

  test("The users which are fetched from get users/api and have been displayed , and clicking on them should add on chat page", async () => {
    render(<SearchUserDrawer open onClose={() => {}} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    const button = screen.getByRole("button", {
      name: /Go/i,
    });

    await user.click(input);
    await user.keyboard("r");
    expect(input).toHaveValue("r");

    await user.click(button);
    // screen.logTestingPlaygroundURL();

    const text = screen.getByText("Test User");
    const email = screen.getByText("testuser@email.com");
    expect(text).toBeInTheDocument();
    expect(email).toBeInTheDocument();

    const userBox = screen.getByText("Test User").closest("div");
    expect(userBox).toBeInTheDocument();

    if (userBox) {
      await user.click(userBox);
    }

    expect(mockSetSelectedChat).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "68506e30e557a0e74d65439f",
        chatName: "sender",
      })
    );
  });
});
