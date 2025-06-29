import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import SearchUserDrawer from "../components/Navbar/SearchUserDrawer";
import ProfileModal from "../components/Navbar/ProfileModal";
import Navbar from "../components/Navbar/Navbar";

const mockUser = {
  name: "Test User",
  pic: "test.png",
  email: "test@example.com",
  _id: "123",
  token: "token123",
};

const mockSetChatsAndNotifications = jest.fn();
jest.mock("../context/ChatProvider", () => ({
  ChatState: () => ({
    user: mockUser,
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
    setSelectedChat: jest.fn(),
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
    Button: ({ children, onClick, onSelect, ...props }: any) => (
      <button
        onClick={onClick || onSelect}
        {...props}
        style={{ pointerEvents: "auto" }}
      >
        {children}
      </button>
    ),

    Menu: {
      Root: ({ children }: any) => <div>{children}</div>,
      Trigger: ({ children }: any) => <div>{children}</div>,
      Positioner: ({ children }: any) => <div>{children}</div>,
      Content: ({ children }: any) => <div>{children}</div>,
      Item: ({ children, onSelect, onClick }: any) => (
        <button onClick={onClick || onSelect} style={{ pointerEvents: "auto" }}>
          {children}
        </button>
      ),
    },

    Avatar: {
      Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      Image: ({ src, ...props }: any) => (
        <img src={src} alt="avatar" {...props} />
      ),
      Fallback: ({ name }: any) => <div>{name?.slice(0, 2)}</div>,
    },
    Portal: ({ children }: any) => <>{children}</>,
  };
});

describe("Checking Navbar", () => {
  test("Checking if components in the DOcument or not ", async () => {
    render(<Navbar fetchAgain setFetchAgain={()=>{}} />);

    const searchUserButton = screen.getByText("Search User");
    expect(searchUserButton).toBeInTheDocument();

    const profileButton = screen.getByLabelText("abc menu");
    expect(profileButton).toBeInTheDocument();
  });

  test("Is search User portal Opening or not ", async () => {
    render(<Navbar fetchAgain setFetchAgain={()=>{}}/>);
    const searchUserButton = screen.getByText("Search User");
    expect(searchUserButton).toBeInTheDocument();

    await user.click(searchUserButton);
    const open = true;
    render(<SearchUserDrawer open={open} onClose={() => {}} />);
  });

  test("IS the profile menu opening or not ", async () => {
    render(<Navbar fetchAgain setFetchAgain={()=>{}}/>);
    const profileButton = screen.getByLabelText("abc menu");
    expect(profileButton).toBeInTheDocument();

    await user.click(profileButton);
    // screen.logTestingPlaygroundURL();

    const profileMenuItem = screen.getByRole("button", {
      name: /profile/i,
      hidden: true,
    });
    expect(profileMenuItem).toBeInTheDocument();

    const logoutButton = screen.getByRole("button", {
      name: /logout/i,
      hidden: true,
    });

    expect(logoutButton).toBeInTheDocument();
  });

  test("Whether profile Modal is opening or not ", async () => {
    render(<Navbar fetchAgain setFetchAgain={()=>{}}/>);
    const profileButton = screen.getByLabelText("abc menu");
    expect(profileButton).toBeInTheDocument();

    await user.click(profileButton);
    // screen.logTestingPlaygroundURL();

    const profileModalButton = screen.getByRole("button", {
      name: /profile/i,
      hidden: true,
    });
    expect(profileModalButton).toBeInTheDocument();

    await user.click(profileModalButton);
    const open = true;
    render(<ProfileModal open={open} onClose={() => {}} user={mockUser} />);
  });

  test("Notications Drawer", async () => {
    render(<Navbar fetchAgain setFetchAgain={()=>{}}/>);
    const notificationsButton = screen.getByLabelText("notiications icon");
    expect(notificationsButton).toBeInTheDocument();

    await user.click(notificationsButton);

    const chatButton = screen.getByRole("button", {
      name: /New message in Yatrik/i,
      hidden: true,
    });
    expect(chatButton).toBeInTheDocument();
    await user.click(chatButton);
  });

  
});
