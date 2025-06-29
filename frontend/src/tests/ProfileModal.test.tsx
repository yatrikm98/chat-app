import ProfileModal from "../components/Navbar/ProfileModal";
import { render } from "./test-utils/render";
import { screen } from "@testing-library/react";

jest.mock("@chakra-ui/react", () => {
  const actualChakra = jest.requireActual("@chakra-ui/react");

  return {
    ...actualChakra,

    // Basic elements
    Text: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    Image: ({ src, alt, ...props }: any) => (
      <img src={src} alt={alt} {...props} />
    ),
    // Dialog mocks
    Dialog: {
      Root: ({ children, open }: any) =>
        open ? <div role="dialog">{children}</div> : null,
      Backdrop: () => <div data-testid="dialog-backdrop" />,
      Positioner: ({ children }: any) => <div>{children}</div>,
      Content: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
      Header: ({ children }: any) => <div>{children}</div>,
      Title: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
      Body: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      CloseTrigger: ({ children }: any) => <>{children}</>,
    },
  };
});

describe("Checking profile modal", () => {
  test("Checkimg if name and email is being displayed", async () => {
    const mockUser = {
      name: "Test User",
      pic: "test.png",
      email: "test@example.com",
      _id: "123",
      token: "token123",
    };


    render(<ProfileModal open onClose={()=>{}} user={mockUser}/>)
    // screen.logTestingPlaygroundURL()

         const namelement =  screen.getByRole('heading', { name: /test user/i })
         expect(namelement).toBeInTheDocument()

         const emailText = screen.getByText(/email:test@example\.com/i)
         expect(emailText).toBeInTheDocument()

  });
});
