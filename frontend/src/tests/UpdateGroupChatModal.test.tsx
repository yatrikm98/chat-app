import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";
import { toaster } from "../components/ui/toaster";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";
import UpdateGroupChatModal from "../components/ChatBox/UpdateGroupChatModal";

const mockUser = {
  name: "Test User",
  pic: "test.png",
  email: "test@example.com",
  _id: "123",
  token: "123",
};

let selectedChatMockValue = {
  _id: "ab123",
  chatName: "Hello",
  isGroupChat: true,
  users: [
    {
      _id: "124",
      name: "Rahul",
      email: "rahul123@gmail.com",
      pic: "abcd.jpg",
    },
    {
      _id: "125",
      name: "Rahul1",
      email: "rahul1231@gmail.com",
      pic: "abcd.jpg",
    },
    mockUser,
  ],
  groupAdmin: {
    name: "Test User",
    pic: "test.png",
    email: "test@example.com",
    _id: "123",
    token: "123",
  },
};

const mockSetSelectedChat = jest.fn((newChat) => {
  selectedChatMockValue = newChat;
});
jest.mock("../context/ChatProvider", () => ({
  ChatState: () => ({
    user: mockUser,
    chats: [{ chatName: "Yatrik", isGroupChat: true }],
    setChats: [],
    selectedChat: selectedChatMockValue,
    setSelectedChat: mockSetSelectedChat,
  }),
}));

jest.mock("../components/ui/toaster", () => ({
  toaster: {
    create: jest.fn(),
  },
}));

const handlers = [
  http.get(`/api/user`, async ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    // console.log(search, "Search In Test");
    if (search === "a") {
      // console.log("Inside If STatement");
      return HttpResponse.json([
        {
          _id: "124",
          name: "Rahul",
          email: "rahul123@gmail.com",
          pic: "abcd.jpg",
        },
        {
          _id: "126",
          name: "Ronak 1",
          email: "ronak1@email.com",
          pic: "123.png",
        },
        {
          _id: "127",
          name: "Ronak 2",
          email: "ronak2@email.com",
          pic: "123.png",
        },
      ]);
    }
    return HttpResponse.json(
      { message: "please enter something" },
      { status: 401 }
    );
  }),

  http.put("/api/chat/groupadd", async ({ request }) => {
    // console.log("Inside of http Put");
    const { chatId, userId } = (await request.json()) as {
      chatId: string;
      userId: string;
    };
    // console.log(chatId, userId, "Line 100");

    if (userId === "126" && chatId == "ab123") {
      // console.log("Inside If of Put Of http");
      return HttpResponse.json({
        _id: "ab123",
        chatName: "Hello",
        isGroupChat: true,
        users: [
          {
            _id: "124",
            name: "Rahul",
            email: "rahul123@gmail.com",
            pic: "abcd.jpg",
          },
          {
            _id: "125",
            name: "Rahul1",
            email: "rahul1231@gmail.com",
            pic: "abcd.jpg",
          },
          mockUser,
          {
            _id: "126",
            name: "Ronak 1",
            email: "ronak1@email.com",
            pic: "123.png",
          },
        ],
        groupAdmin: {
          name: "Test User",
          pic: "test.png",
          email: "test@example.com",
          _id: "123",
          token: "123",
        },
      });
    }
    return HttpResponse.json(
      { message: "please enter something" },
      { status: 401 }
    );
  }),
  http.put("/api/chat/groupremove", async ({ request }) => {
    // console.log("Inside of http Put");
    const { chatId, userId } = (await request.json()) as {
      chatId: string;
      userId: string;
    };
    // console.log(chatId, userId, "Line 100");

    if (userId === mockUser._id) {
      return HttpResponse.json(null);
    }

    if (userId === "126" && chatId == "ab123") {
      // console.log("Inside If of Put Of http");
      return HttpResponse.json({
        _id: "ab123",
        chatName: "Hello",
        isGroupChat: true,
        users: [
          {
            _id: "124",
            name: "Rahul",
            email: "rahul123@gmail.com",
            pic: "abcd.jpg",
          },
          {
            _id: "125",
            name: "Rahul1",
            email: "rahul1231@gmail.com",
            pic: "abcd.jpg",
          },
          mockUser,
        ],
        groupAdmin: {
          name: "Test User",
          pic: "test.png",
          email: "test@example.com",
          _id: "123",
          token: "123",
        },
      });
    }
    return HttpResponse.json(
      { message: "please enter something" },
      { status: 401 }
    );
  }),
  http.put("/api/chat/rename", async ({ request }) => {
    // console.log("Inside of http Put");
    const { chatName } = (await request.json()) as {
      chatName: string;
      chatId: string;
    };
    // console.log(chatId, userId, "Line 100");

    if (chatName === "Trio") {
      // console.log("Inside If of Put Of http Rename");
      return HttpResponse.json({
        _id: "ab123",
        chatName: "Trio",
        isGroupChat: true,
        users: [
          {
            _id: "124",
            name: "Rahul",
            email: "rahul123@gmail.com",
            pic: "abcd.jpg",
          },
          {
            _id: "125",
            name: "Rahul1",
            email: "rahul1231@gmail.com",
            pic: "abcd.jpg",
          },
          mockUser,
        ],
        groupAdmin: {
          name: "Test User",
          pic: "test.png",
          email: "test@example.com",
          _id: "123",
          token: "123",
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

describe("Update Group Chat Model", () => {
  describe("Searching Users Api", () => {
    test("Search Users Api", async () => {
      render(
        <UpdateGroupChatModal
          fetchAllMessages={() => {}}
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
        />
      );
      const searchInput = screen.getByPlaceholderText("Add Users");

      expect(searchInput).toBeInTheDocument();
      await user.click(searchInput);
      await user.keyboard("a");
      expect(searchInput).toHaveValue("a");

      // screen.debug();

      const searchedUSerBox1 = screen.getByTestId("search-results-box-124");
      expect(searchedUSerBox1).toBeInTheDocument();
    });

    test("Searched users did not appear", async () => {
      render(
        <UpdateGroupChatModal
          fetchAllMessages={() => {}}
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
        />
      );
      const searchInput = screen.getByPlaceholderText("Add Users");

      expect(searchInput).toBeInTheDocument();
      await user.click(searchInput);
      await user.keyboard("b");
      // expect(searchInput).toHaveValue("b");

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

  describe("Adding Users Api", () => {
    test("Handle Adding User which is already present", async () => {
      render(
        <UpdateGroupChatModal
          fetchAllMessages={() => {}}
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
        />
      );
      const searchInput = screen.getByPlaceholderText("Add Users");

      expect(searchInput).toBeInTheDocument();
      await user.click(searchInput);
      await user.keyboard("a");
      expect(searchInput).toHaveValue("a");

      // screen.debug();

      const searchedUSerBox1 = screen.getByTestId("search-results-box-124");
      expect(searchedUSerBox1).toBeInTheDocument();

      await user.click(searchedUSerBox1);

      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "User already added",
          type: "error",
          duration: 5000,
          closable: true,
        })
      );
    });

    test("Handle adding user which is not present and the user which is adding is not admin", async () => {
      render(
        <UpdateGroupChatModal
          fetchAllMessages={() => {}}
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
        />
      );
      const searchInput = screen.getByPlaceholderText("Add Users");

      expect(searchInput).toBeInTheDocument();
      await user.click(searchInput);
      await user.keyboard("a");
      expect(searchInput).toHaveValue("a");

      // screen.debug();
      mockUser._id = "456";
      const searchedUSerBox1 = screen.getByTestId("search-results-box-126");
      expect(searchedUSerBox1).toBeInTheDocument();

      await user.click(searchedUSerBox1);

      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Only Admins can add someone!",
          type: "error",
          duration: 5000,
          closable: true,
        })
      );
    });

    test("adding user when the user is admin ", async () => {
      render(
        <UpdateGroupChatModal
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
          fetchAllMessages={() => {}}
        />
      );
      const searchInput = screen.getByPlaceholderText("Add Users");

      expect(searchInput).toBeInTheDocument();
      await user.click(searchInput);
      await user.keyboard("a");
      expect(searchInput).toHaveValue("a");
      mockUser._id = "123";

      const searchedUSerBox1 = screen.getByTestId("search-results-box-126");
      expect(searchedUSerBox1).toBeInTheDocument();

      await user.click(searchedUSerBox1);

      const addedUser = screen.getByTestId("search-results-box-Ronak 1");
      expect(addedUser).toBeInTheDocument();
    });
    test("adding a user through api is giving error", async () => {
      render(
        <UpdateGroupChatModal
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
          fetchAllMessages={() => {}}
        />
      );
      const searchInput = screen.getByPlaceholderText("Add Users");

      expect(searchInput).toBeInTheDocument();
      await user.click(searchInput);
      await user.keyboard("a");
      expect(searchInput).toHaveValue("a");
      mockUser._id = "123";

      const searchedUSerBox1 = screen.getByTestId("search-results-box-127");
      expect(searchedUSerBox1).toBeInTheDocument();

      await user.click(searchedUSerBox1);

      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to Add User",
          type: "error",
          duration: 5000,
          closable: true,
        })
      );
    });
  });

  describe("Removing a User", () => {
    test("handle Remove User if you are not admin", async () => {
      render(
        <UpdateGroupChatModal
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
          fetchAllMessages={() => {}}
        />
      );
      const searchInput = screen.getByPlaceholderText("Add Users");

      expect(searchInput).toBeInTheDocument();
      await user.click(searchInput);
      await user.keyboard("a");
      expect(searchInput).toHaveValue("a");
      mockUser._id = "123";

      const searchedUSerBox1 = screen.getByTestId("search-results-box-126");
      expect(searchedUSerBox1).toBeInTheDocument();

      await user.click(searchedUSerBox1);

      const addedUser = screen.getByTestId("search-results-box-Ronak 1");
      expect(addedUser).toBeInTheDocument();
      mockUser._id = "190";
      await user.click(addedUser);

      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Only Admins can Remove someone!",
          type: "error",
          duration: 5000,
          closable: true,
        })
      );
    });

    test("Admin is deleting the user", async () => {
      render(
        <UpdateGroupChatModal
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
          fetchAllMessages={() => {}}
        />
      );
      const searchInput = screen.getByPlaceholderText("Add Users");

      expect(searchInput).toBeInTheDocument();
      await user.click(searchInput);
      await user.keyboard("a");
      expect(searchInput).toHaveValue("a");
      mockUser._id = "123";

      const searchedUSerBox1 = screen.getByTestId("search-results-box-126");
      expect(searchedUSerBox1).toBeInTheDocument();

      await user.click(searchedUSerBox1);

      const addedUser = screen.getByTestId("search-results-box-Ronak 1");
      expect(addedUser).toBeInTheDocument();
      mockUser._id = "123";
      await user.click(addedUser);

      await waitFor(() =>
        expect(
          screen.queryByTestId("search-results-box-Ronak 1")
        ).not.toBeInTheDocument()
      );
    });
  });

  describe("Renaming a group ", () => {
    test("Handle rename of group", async () => {
      render(
        <UpdateGroupChatModal
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
          fetchAllMessages={() => {}}
        />
      );
      const renameCHatInput = screen.getByPlaceholderText("Chat Name");
      expect(renameCHatInput).toBeInTheDocument();

      await user.click(renameCHatInput);
      await user.keyboard("Trio");

      const updateButton = screen.getByRole("button", {
        name: /Update/,
      });

      expect(updateButton).toBeInTheDocument();
      await user.click(updateButton);

      await waitFor(() =>
        expect(screen.getByTestId("chatname")).toHaveTextContent("Trio")
      );
    });
  });

  describe("Leaving Group Yourself", () => {
    test("Leaving Group Yourself ", async () => {
      render(
        <UpdateGroupChatModal
          fetchAgain
          setFetchAgain={() => {}}
          open
          onClose={() => {}}
          fetchAllMessages={() => {}}
        />
      );

      const button = screen.getByRole("button", {
        name: /Leave Group/i,
      });

      expect(button).toBeInTheDocument();

      await user.click(button);

      await waitFor(() => {
        expect(mockSetSelectedChat).toHaveBeenCalledWith(null);
      });
    });
  });
});
