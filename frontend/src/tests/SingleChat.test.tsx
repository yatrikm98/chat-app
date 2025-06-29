import SingleChat from "../components/ChatBox/SingleChat";
import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";

jest.mock("react-lottie", () => () => <div data-testid="lottie" />);

const mockEmit = jest.fn();
const mockOn = jest.fn();
const mockOff = jest.fn();

jest.mock("socket.io-client", () => ({
  __esModule: true,
  default: () => ({
    emit: mockEmit,
    on: mockOn,
    off: mockOff,
  }),
  io: () => ({
    emit: mockEmit,
    on: mockOn,
    off: mockOff,
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

const mockUser = {
  name: "Test User",
  pic: "test.png",
  email: "test@example.com",
  _id: "123",
  token: "123",
};

const mockChatState = jest.fn();

jest.mock("../context/ChatProvider", () => ({
  ChatState: () => mockChatState(),
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

describe("Checking SingleChat.tsx Page", () => {
  test("When Selected Chat is null", async () => {
    mockChatState.mockReturnValue({
      user: mockUser,
      chatsAndNotifications: [],
      selectedChat: null,
      setSelectedChat: jest.fn(),
    });
    render(<SingleChat fetchAgain setFetchAgain={() => {}} />);

    const text = screen.getByTestId("CLick on user to start chatting");
    expect(text).toBeInTheDocument();
  });

  test("When Selected Chat is present", async () => {
    mockChatState.mockReturnValue({
      user: mockUser,
      selectedChat: {
        _id: "ab123",
        chatName: "Hello",
        isGroupChat: true,
        users: [
          {
            _id: "123",
            name: "Rahul",
            email: "rahul123@gmail.com",
            pic: "abcd.jpg",
          },
          {
            _id: "124",
            name: "Rahul1",
            email: "rahul1231@gmail.com",
            pic: "abcd.jpg",
          },
          mockUser,
        ],
        groupAdmin: mockUser,
      },
    });

    render(<SingleChat fetchAgain setFetchAgain={() => {}} />);

    const text = screen.getByText("HELLO");
    expect(text).toBeInTheDocument();
  });
});
