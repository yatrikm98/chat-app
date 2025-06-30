import ScrollToBottom from "react-scroll-to-bottom";
import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isSameUser,
} from "../../handlers/ChatLogics";
import { ChatState } from "../../context/ChatProvider";
import { Tooltip } from "../ui/tooltip";
import { Avatar } from "@chakra-ui/react";
import { css } from "@emotion/css";
import { useScrollToBottom } from "react-scroll-to-bottom";
import { useEffect } from "react";
import "./scrollable.css";
import { Message } from "../../Interfaces/Message";
import { FcClock } from "react-icons/fc";


interface ScrollableChatProps {
  messages: Message[];
}

const Content = ({ messages }: ScrollableChatProps) => {
  const { user } = ChatState();
  const scrollToBottom = useScrollToBottom();

  useEffect(() => {
    scrollToBottom({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {messages &&
        messages.map((m, i) => {
          const tooltipId = `tooltip-${m._id}`;
          return (
            <div style={{ display: "flex", alignItems: "center" }} key={m._id}>
              {user &&
                (isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                  <Tooltip
                    content={m.sender.name}
                    showArrow
                    ids={{ trigger: tooltipId }}
                  >
                    <Avatar.Root size="sm" key="sm" ids={{ root: tooltipId }}>
                      <Avatar.Fallback name={m.sender.name} />
                      <Avatar.Image
                        src={m.sender.pic || undefined}
                        cursor="pointer"
                        mr={1}
                      />
                    </Avatar.Root>
                  </Tooltip>
                )}
              <>
                <span
                  style={{
                    backgroundColor: `${
                      m.sender._id === user?._id ? "#BEE3F8" : "#B9F5D0"
                    }`,
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    marginLeft: isSameSenderMargin(
                      messages,
                      m,
                      i,
                      user && user._id
                    ),
                    marginTop: isSameUser(messages, m, i) ? 3 : 0,
                    display:"flex"
                  }}
                  data-testid={`content-${m._id}`}
                >
                  {m.content}
                </span>
                {m.sentMessageloading && <span><FcClock /></span>}
              </>
            </div>
          );
        })}
    </>
  );
};

const ROOT_CSS = css({
  height: "100%",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

const ScrollableChat = ({ messages }: ScrollableChatProps) => {
  return (
    <ScrollToBottom className={`${ROOT_CSS} removeButton`}>
      <Content messages={messages} />
    </ScrollToBottom>
  );
};

export default ScrollableChat;
