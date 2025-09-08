import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../../../apiCalls/message";
import { showLoader, hideLoader } from "../../../redux/loaderSlice";
import { clearUnreadMessageCount } from "./../../../apiCalls/chat";
import { setAllChats } from "../../../redux/usersSlice";
import EmojiPicker from "emoji-picker-react";
import moment from "moment";
import store from "./../../../redux/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function ChatArea({ socket }) {
  const dispatch = useDispatch();
  const { selectedChat, user, allChats } = useSelector(
    (state) => state.user
  );

  const selectedUser =
    selectedChat?.members?.find((u) => u._id !== user?._id) || null;

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingData, setTypingData] = useState(null);

  // Format user name
  const formatName = (u) => {
    if (!u) return "";
    const fname = u.firstname?.charAt(0).toUpperCase() + u.firstname?.slice(1).toLowerCase();
    const lname = u.lastname?.charAt(0).toUpperCase() + u.lastname?.slice(1).toLowerCase();
    return `${fname} ${lname}`;
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const now = moment();
    const diff = now.diff(moment(timestamp), "days");
    if (diff < 1) return `Today ${moment(timestamp).format("hh:mm A")}`;
    if (diff === 1) return `Yesterday ${moment(timestamp).format("hh:mm A")}`;
    return moment(timestamp).format("MMM D, hh:mm A");
  };

  // Fetch messages
  const getMessages = async () => {
    if (!selectedChat?._id) return;
    try {
      dispatch(showLoader());
      const response = await getAllMessages(selectedChat._id);
      dispatch(hideLoader());
      if (response.success) setAllMessages(response.data);
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
    }
  };

  // Clear unread messages
  const clearUnreadMessages = async () => {
    if (!selectedChat?._id) return;
    try {
      socket.emit("clear-unread-messages", {
        chatId: selectedChat._id,
        members: selectedChat.members.map((m) => m._id),
      });

      const response = await clearUnreadMessageCount(selectedChat._id);
      if (response.success) {
        const updatedChats = allChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, unreadMessageCount: 0 }
            : chat
        );
        dispatch(setAllChats(updatedChats));
        setAllMessages((prev) =>
          prev.map((msg) => ({ ...msg, read: true }))
        );
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message
  const sendMessage = async (image = null) => {
    if (!message.trim() && !image) return;
    try {
      const newMessage = {
        chatId: selectedChat._id,
        sender: user._id,
        text: message,
        image: image,
      };

      socket.emit("send-message", {
        ...newMessage,
        members: selectedChat.members.map((m) => m._id),
        read: false,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      const response = await createNewMessage(newMessage);
      if (response.success) {
        setMessage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle image upload
  const sendImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => sendMessage(reader.result);
  };

  // Listen for messages and typing
  useEffect(() => {
    if (!selectedChat?._id) return;

    getMessages();
    if (selectedChat?.lastMessage?.sender !== user._id) clearUnreadMessages();

    const receiveHandler = (message) => {
      const currentSelectedChat = store.getState().user.selectedChat;
      if (currentSelectedChat?._id === message.chatId) {
        setAllMessages((prev) => [...prev, message]);
        if (message.sender !== user._id) clearUnreadMessages();
      }
    };

    const typingHandler = (data) => {
      setTypingData(data);
      if (selectedChat._id === data.chatId && data.sender !== user._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };

    const countClearedHandler = (data) => {
      const currentSelectedChat = store.getState().user.selectedChat;
      const allChatsState = store.getState().user.allChats;
      if (currentSelectedChat?._id === data.chatId) {
        const updatedChats = allChatsState.map((chat) =>
          chat._id === data.chatId ? { ...chat, unreadMessageCount: 0 } : chat
        );
        dispatch(setAllChats(updatedChats));
        setAllMessages((prev) => prev.map((msg) => ({ ...msg, read: true })));
      }
    };

    socket.on("receive-message", receiveHandler);
    socket.on("started-typing", typingHandler);
    socket.on("message-count-cleared", countClearedHandler);

    return () => {
      socket.off("receive-message", receiveHandler);
      socket.off("started-typing", typingHandler);
      socket.off("message-count-cleared", countClearedHandler);
    };
  }, [selectedChat?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    const msgContainer = document.getElementById("main-chat-area");
    if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
  }, [allMessages, isTyping]);

  if (!selectedChat) return null;

  return (
    <div className="app-chat-area">
      <div className="app-chat-area-header">{formatName(selectedUser)}</div>

      <div className="main-chat-area" id="main-chat-area">
        {allMessages.map((msg, index) => {
          const isCurrentUser = msg.sender === user._id;
          return (
            <div
              className="message-container"
              key={index}
              style={{ justifyContent: isCurrentUser ? "end" : "start" }}
            >
              <div>
                <div className={isCurrentUser ? "send-message" : "received-message"}>
                  <div>{msg.text}</div>
                  {msg.image && <img src={msg.image} alt="img" height="120" width="120" />}
                </div>
                <div
                  className="message-timestamp"
                  style={{ float: isCurrentUser ? "right" : "left" }}
                >
                  {formatTime(msg.createdAt)}{" "}
                  {isCurrentUser && msg.read && (
                    <i className="fa fa-check-circle" style={{ color: "#e74c3c" }}></i>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div className="typing-indicator">
          {isTyping &&
            selectedChat.members.map((m) => m._id).includes(typingData?.sender) && (
              <i>typing...</i>
            )}
        </div>
      </div>

      {showEmojiPicker && (
        <div style={{ width: "100%", display: "flex", padding: "0 20px", justifyContent: "right" }}>
          <EmojiPicker
            style={{ width: "300px", height: "400px" }}
            onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)}
          />
        </div>
      )}

      <div className="send-message-div">
        <input
          type="text"
          className="send-message-input"
          placeholder="Type a message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            socket.emit("user-typing", {
              chatId: selectedChat._id,
              members: selectedChat.members.map((m) => m._id),
              sender: user._id,
            });
          }}
        />
        <label htmlFor="file">
          <i className="fa fa-picture-o send-image-btn"></i>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            accept="image/*"
            onChange={sendImage}
          />
        </label>
        <button
          className="fa fa-smile-o send-emoji-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />
        <button className="fa fa-paper-plane send-message-btn" onClick={() => sendMessage("")} />
      </div>
    </div>
  );
}

export default ChatArea;
