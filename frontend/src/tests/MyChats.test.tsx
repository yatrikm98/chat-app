import MyChats from "../components/ChatsDisplay/MyChats";
import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";
import { toaster } from "../components/ui/toaster";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";

const mockSetChatsAndNotifications = jest.fn();
const mockSetSelectedChat = jest.fn();

const mockUser = {
  name: "Test User",
  pic: "test.png",
  email: "test@example.com",
  _id: "123",
  token: "123",
};
jest.mock("../context/ChatProvider", () => ({
  ChatState: () => ({
    user: mockUser,
    chatsAndNotifications: [
      {
        _id: "123",
        chatName: "Yatrik",
        isGroupChat:true,
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
    setSelectedChat: mockSetSelectedChat,
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
    Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
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
  http.get(`/api/chat`, async () => {
    if (mockUser.token === "123") {
      return HttpResponse.json([
        {
          _id: "abc",
          chatName:"Yatrik",
          isGroupChat: true,
          users: [
            {
              _id: "68506eab7be49080635c15ce",
              name: "raavi",
              email: "raavi@gmail.com",
              pic: "",
            },
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
          groupAdmin: {
            _id: "685046936b171d3f9c5395a3",
            name: "John Doe",
            email: "johndoe@gmail.com",
          },
          latestMessage: {
            content: "hello",
            sender: {
              name: "YAtrik",
            },
          },
        },
      ]);
    }

    return HttpResponse.json(
      { message: "please enter something" },
      { status: 401 }
    );
  }),

  http.get(`/api/notification/${mockUser._id}`, async () => {
    if (mockUser._id === "123") {
      return HttpResponse.json([
        {
          chatId: "abc",
          noOfUnreadMessages: 2,
          usersOffline: [{ userId: "123", count: 2 }],
        },
      ]);
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
  // server.listen()
});
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  // server.close()
});
afterAll(() => server.close());

describe("Performing Tests for MyChats Page", () => {
  test("Fetching Chats And Notifications", async () => {
    render(<MyChats fetchAgain setFetchAgain={() => {}} />);

    await waitFor(() =>
      expect(mockSetChatsAndNotifications).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            _id: "abc", // ✅ Match what your MSW handler returns
            chatName: "Yatrik",
            isGroupChat: true,
          }),
        ])
      )
    );
  });

  test("fetching error in loading chats", async () => {
    render(<MyChats fetchAgain setFetchAgain={() => {}} />);
    mockUser.token = "4567";

    await waitFor(() =>
      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to load the Chats",
          type: "error",
          duration: 5000,
          closable: true,
        })
      )
    );
  });

  test("failed to load Notifications", async () => {
    render(<MyChats fetchAgain setFetchAgain={() => {}} />);
    mockUser.token = "123";
    mockUser._id = "12";

    await waitFor(() =>
      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to Load Notifications",
          type: "warning",
          duration: 5000,
          closable: true,
        })
      )
    );
  });

  test("Checking Group Name Visible", async () => {
    render(<MyChats fetchAgain setFetchAgain={()=>{}}/>);
    mockUser.token = "123";
    mockUser._id = "123"
    // screen.debug();
    const groupChatName = await screen.findByText("Yatrik");
    expect(groupChatName).toBeInTheDocument();
  });
});
