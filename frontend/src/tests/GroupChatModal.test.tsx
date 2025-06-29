import GroupChatModal from "../components/ChatsDisplay/GroupChatModal";
import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";
import { toaster } from "../components/ui/toaster";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import user from "@testing-library/user-event";

const mockSetChats = jest.fn();
const mockSetSelectedChat = jest.fn();

const mockUser = {
  name: "Test User",
  pic: "test.png",
  email: "test@example.com",
  _id: "123",
  token: "123",
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
  http.get(`/api/user`, async ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    console.log(search, "Search");
    if (search === "a") {
      console.log("Inside If STatement");
      return HttpResponse.json([
        {
          _id: "123",
          name: "Test User",
          email: "testuser@email.com",
          pic: "123.png",
        },
        {
          _id: "124",
          name: "Test User1",
          email: "testuse1r@email.com",
          pic: "123.png",
        },
      ]);
    }
    return HttpResponse.json(
      { message: "please enter something" },
      { status: 401 }
    );
  }),
  http.post("/api/chat/group", async ({ request }) => {
    const { name, users } = (await request.json()) as {
      name: string;
      users: {
        _id: string;
        name: string;
        email: string;
        pic: string;
      }[];
    };
    if (name && users.length >= 2 && name !== "arman") {
      return HttpResponse.json({
        _id: "6852cedbd043a8626ed29670",
        chatName: "Group Chat 1",
        isGroupChat: true,
        users: [
          {
            _id: "68506eab7be49080635c15ce",
            name: "raavi",
            email: "raavi@gmail.com",
            pic: "",
          },
          {
            _id: "68504a236b171d3f9c5395a6",
            name: "ronak",
            email: "ronak@gmail.com",
            pic: "",
          },
          {
            _id: "685046936b171d3f9c5395a3",
            name: "John Doe",
            email: "johndoe@gmail.com",
            pic: "http://res.cloudinary.com/dttfnjfr4/image/upload/v1750091396/Screenshot_2025-06-16_at_5.38.06_PM_acae2g.png",
          },
        ],
        groupAdmin: {
          _id: "685046936b171d3f9c5395a3",
          name: "John Doe",
          email: "johndoe@gmail.com",
          pic: "http://res.cloudinary.com/dttfnjfr4/image/upload/v1750091396/Screenshot_2025-06-16_at_5.38.06_PM_acae2g.png",
        },
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
  // server.listen()
});
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  // server.close()
});
afterAll(() => server.close());

describe("Group Chat MOdal Functionalities", () => {
  describe("Search Api", () => {
    test("Adding something to search ", async () => {
      render(<GroupChatModal open onClose={() => {}} />);

      const input = screen.getByPlaceholderText(
        "Add Users eg: John , Piyush , Jane"
      );
      expect(input).toBeInTheDocument();

      await user.click(input);
      await user.keyboard("a");

      expect(input).toHaveValue("a");

      const text = screen.getByText("Test User");
      const email = screen.getByText("testuser@email.com");
      expect(text).toBeInTheDocument();
      expect(email).toBeInTheDocument();
    });

    test("If searching something fails", async () => {
      render(<GroupChatModal open onClose={() => {}} />);

      const input = screen.getByPlaceholderText(
        "Add Users eg: John , Piyush , Jane"
      );
      expect(input).toBeInTheDocument();

      await user.click(input);
      await user.keyboard("b");

      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to Load Search Results",
          type: "error",
          duration: 5000,
          closable: true,
        })
      );
    });
  });

  describe("Adding User ", () => {
    test("After seacrhing the users ,we are adding the users", async () => {
      render(<GroupChatModal open onClose={() => {}} />);

      const input = screen.getByPlaceholderText(
        "Add Users eg: John , Piyush , Jane"
      );
      expect(input).toBeInTheDocument();

      await user.click(input);
      await user.keyboard("a");

      expect(input).toHaveValue("a");

      const text = screen.getByText("Test User");
      const email = screen.getByText("testuser@email.com");
      expect(text).toBeInTheDocument();
      expect(email).toBeInTheDocument();
      // screen.logTestingPlaygroundURL();

      const searchedUSerBox = screen.getByTestId("search-results-box-123");
      expect(searchedUSerBox).toBeInTheDocument();
      await user.click(searchedUSerBox);
      // screen.debug();
      const addedUserBox = screen.getByTestId("search-results-box-123");
      expect(addedUserBox).toBeInTheDocument();
    });

    test("Adding the same user again", async () => {
      render(<GroupChatModal open onClose={() => {}} />);

      const input = screen.getByPlaceholderText(
        "Add Users eg: John , Piyush , Jane"
      );
      expect(input).toBeInTheDocument();

      await user.click(input);
      await user.keyboard("a");

      expect(input).toHaveValue("a");

      const text = screen.getByText("Test User");
      const email = screen.getByText("testuser@email.com");
      expect(text).toBeInTheDocument();
      expect(email).toBeInTheDocument();
      // screen.logTestingPlaygroundURL();

      const searchedUSerBox = screen.getByTestId("search-results-box-123");
      expect(searchedUSerBox).toBeInTheDocument();
      await user.click(searchedUSerBox);
      // screen.debug();
      const addedUserBox = screen.getByTestId("search-results-box-123");
      expect(addedUserBox).toBeInTheDocument();

      await user.click(searchedUSerBox);
      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "User already added",
          type: "warning",
          duration: 5000,
          closable: true,
        })
      );
    });
  });

  describe("Creating a Group Chat", () => {
    test("Finally Creating a Chat without credentials", async () => {
      render(<GroupChatModal open onClose={() => {}} />);
      const button = screen.getByRole("button", {
        name: /Create Chat/,
      });

      expect(button).toBeInTheDocument();
      await user.click(button);

      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Please fill all the fields",
          type: "warning",
          duration: 5000,
          closable: true,
        })
      );
    });

    test("Creating Chat. with credentials", async () => {
      render(<GroupChatModal open onClose={() => {}} />);
      const button = screen.getByRole("button", {
        name: /Create Chat/,
      });

      expect(button).toBeInTheDocument();

      const input = screen.getByPlaceholderText(
        "Add Users eg: John , Piyush , Jane"
      );

      const nameInput = screen.getByPlaceholderText("Chat Name");
      expect(input).toBeInTheDocument();

      await user.click(nameInput);
      await user.keyboard("Trio");

      await user.click(input);
      await user.keyboard("a");

      expect(input).toHaveValue("a");

      const text = screen.getByText("Test User");
      const email = screen.getByText("testuser@email.com");
      expect(text).toBeInTheDocument();
      expect(email).toBeInTheDocument();
      // screen.logTestingPlaygroundURL();

      const searchedUSerBox1 = screen.getByTestId("search-results-box-123");
      expect(searchedUSerBox1).toBeInTheDocument();
      await user.click(searchedUSerBox1);

      const searchedUSerBox2 = screen.getByTestId("search-results-box-124");
      expect(searchedUSerBox2).toBeInTheDocument();
      await user.click(searchedUSerBox2);
      // screen.debug();
      const addedUserBox = screen.getByTestId("search-results-box-123");
      expect(addedUserBox).toBeInTheDocument();

      const addedUserBox1 = screen.getByTestId("search-results-box-124");
      expect(addedUserBox1).toBeInTheDocument();

      await user.click(button);

      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Group Chat created",
          type: "success",
          duration: 5000,
          closable: true,
        })
      );
    });

    test("Filled all details but group length was less than 2", async () => {
      render(<GroupChatModal open onClose={() => {}} />);
      const button = screen.getByRole("button", {
        name: /Create Chat/,
      });

      expect(button).toBeInTheDocument();

      const input = screen.getByPlaceholderText(
        "Add Users eg: John , Piyush , Jane"
      );

      const nameInput = screen.getByPlaceholderText("Chat Name");
      expect(input).toBeInTheDocument();

      await user.click(nameInput);
      await user.keyboard("arman");

      await user.click(input);
      await user.keyboard("a");

      expect(input).toHaveValue("a");

      const text = screen.getByText("Test User");
      const email = screen.getByText("testuser@email.com");
      expect(text).toBeInTheDocument();
      expect(email).toBeInTheDocument();
      // screen.logTestingPlaygroundURL();

      const searchedUSerBox1 = screen.getByTestId("search-results-box-123");
      expect(searchedUSerBox1).toBeInTheDocument();
      await user.click(searchedUSerBox1);

      const searchedUSerBox2 = screen.getByTestId("search-results-box-124");
      expect(searchedUSerBox2).toBeInTheDocument();
      await user.click(searchedUSerBox2);
      // screen.debug();
      const addedUserBox = screen.getByTestId("search-results-box-123");
      expect(addedUserBox).toBeInTheDocument();

      const addedUserBox1 = screen.getByTestId("search-results-box-124");
      expect(addedUserBox1).toBeInTheDocument();

      await user.click(button);

      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to create Chat",
          type: "error",
          duration: 5000,
          closable: true,
        })
      );
    });
  });
});
