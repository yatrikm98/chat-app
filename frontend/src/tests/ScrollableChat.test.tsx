import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";
import ScrollableChat from "../components/ChatBox/ScrollableChat";

jest.mock("react-scroll-to-bottom", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useScrollToBottom: () => jest.fn(), // or simply: () => () => {}
}));

const mockUser = {
  name: "Test User",
  pic: "test.png",
  email: "test@example.com",
  _id: "123",
  token: "token123",
};

jest.mock("../context/ChatProvider", () => ({
  ChatState: () => ({
    user: mockUser,
    chats: [],
  }),
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

    Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,

    Spinner: (props: any) => (
      <div role="status" {...props}>
        Loading...
      </div>
    ),

    Avatar: {
      Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Image: ({ src, ...props }: any) => (
        <img src={src} alt="avatar" {...props} />
      ),
      Fallback: ({ name }: any) => <div>{name?.slice(0, 2)}</div>,
    },
  };
});

describe("Scrollable Chat Component", () => {
  test("Checking whether messages are beingdisplayed or not ", async () => {
    const messages = [
      {
        sender: mockUser,
        content: "content1",
        chat: {
          _id: "chat1",
          chatName: "chatName1",
          isGroupChat: false,
          users: [
            {
              _id: "user4id",
              name: "user4",
              email: "user4@gmail.com",
              pic: "abc",
            },
            mockUser,
          ],
          latestMessage: "latestmessage1",
        },
        _id: "message1",
      },
      {
        sender: {
          _id: "user4id",
          name: "user4",
          email: "user4@gmail.com",
          pic: "abc",
        },
        content: "content2",
        chat: {
          _id: "chat2",
          chatName: "chatName2",
          isGroupChat: false,
          users: [
            {
              _id: "user4id",
              name: "user4",
              email: "user4@gmail.com",
              pic: "abc",
            },
            mockUser,
          ],
          latestMessage: "latestmessage2",
        },
        _id: "message2",
      },
    ];
    render(<ScrollableChat messages={messages} />);

    const messageSpan = screen.getByTestId(`content-${messages[0]._id}`);
    expect(messageSpan).toBeInTheDocument();

    const messageSpan1 = screen.getByTestId(`content-${messages[1]._id}`);
    expect(messageSpan1).toBeInTheDocument();
  });
});
