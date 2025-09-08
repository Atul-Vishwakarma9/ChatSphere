import { useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import toast from "react-hot-toast";
import moment from "moment";
import store from "../../../redux/store";

import { createNewChat } from "../../../apiCalls/chat";
import { showLoader, hideLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../../../redux/usersSlice";

function UsersList({ searchKey = "", socket, onlineUser = [] }) {
  const dispatch = useDispatch();

  // Use shallowEqual to prevent unnecessary rerenders
  const { users: allUsers = [], allChats = [], user: currentUser, selectedChat } =
    useSelector(
      (state) => ({
        users: state.user.users,
        allChats: state.user.allChats,
        user: state.user.user,
        selectedChat: state.user.selectedChat,
      }),
      shallowEqual
    );

  // Start a new chat
  const startNewChat = async (otherUserId) => {
    try {
      if (!currentUser?._id) return;

      dispatch(showLoader());
      const response = await createNewChat([currentUser._id, otherUserId]);
      dispatch(hideLoader());

      if (response.success) {
        const newChat = response.data;
        dispatch(setAllChats([...allChats, newChat]));
        dispatch(setSelectedChat(newChat));
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message || "Failed to create chat");
    }
  };

  // Open existing chat
  const openChat = (otherUserId) => {
    const chat = allChats.find(
      (c) =>
        c.members?.some((m) => m._id === currentUser._id) &&
        c.members?.some((m) => m._id === otherUserId)
    );
    if (chat) dispatch(setSelectedChat(chat));
  };

  // Check if user is in selected chat
  const isSelectedChat = (user) =>
    selectedChat?.members?.some((m) => m?._id === user?._id) || false;

  // Last message preview
  const getLastMessage = (userId) => {
    const chat = allChats.find((c) => c.members?.some((m) => m?._id === userId));
    if (!chat?.lastMessage) return "";
    const prefix = chat.lastMessage.sender === currentUser?._id ? "You: " : "";
    return prefix + chat.lastMessage.text?.substring(0, 25);
  };

  // Last message timestamp
  const getLastMessageTimeStamp = (userId) => {
    const chat = allChats.find((c) => c.members?.some((m) => m?._id === userId));
    return chat?.lastMessage ? moment(chat.lastMessage.createdAt).format("hh:mm A") : "";
  };

  // Unread message counter
  const getUnreadMessageCount = (userId) => {
    const chat = allChats.find((c) => c.members?.some((m) => m?._id === userId));
    if (chat?.unreadMessageCount && chat.lastMessage?.sender !== currentUser?._id) {
      return <div className="unread-message-counter">{chat.unreadMessageCount}</div>;
    }
    return null;
  };

  // Format user name
  const formatName = (user) => {
    const fname = user?.firstname
      ? user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase()
      : "";
    const lname = user?.lastname
      ? user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1).toLowerCase()
      : "";
    return `${fname} ${lname}`.trim();
  };

  // Socket message count handler
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      const selected = store.getState().user.selectedChat;
      let chats = store.getState().user.allChats;

      if (selected?._id !== message.chatId) {
        chats = chats.map((chat) =>
          chat._id === message.chatId
            ? { ...chat, unreadMessageCount: (chat?.unreadMessageCount || 0) + 1, lastMessage: message }
            : chat
        );
      }

      const latestChat = chats.find((chat) => chat._id === message.chatId);
      const otherChats = chats.filter((chat) => chat._id !== message.chatId);
      chats = latestChat ? [latestChat, ...otherChats] : chats;

      dispatch(setAllChats(chats));
    };

    socket.on("set-message-count", handleMessage);
    return () => socket.off("set-message-count", handleMessage);
  }, [socket, dispatch]);

  // Filter users and chats for search
  const getData = () => {
    if (!searchKey) {
      // show all chats first, then users without chat
      const usersWithoutChat = allUsers.filter(
        (u) => !allChats.some((c) => c.members?.some((m) => m._id === u._id))
      );
      return [...allChats, ...usersWithoutChat];
    }
    return allUsers.filter(
      (u) =>
        u.firstname?.toLowerCase().includes(searchKey.toLowerCase()) ||
        u.lastname?.toLowerCase().includes(searchKey.toLowerCase())
    );
  };

  const data = getData();
  if (!data.length) return <div className="no-users">No users or chats found</div>;

  return data.map((obj, index) => {
    const user = obj?.members
      ? obj.members.find((mem) => mem?._id !== currentUser?._id)
      : obj;

    if (!user?._id) return null;

    const hasChat = allChats.find((chat) =>
      chat.members?.some((m) => m?._id === user._id)
    );

    return (
      <div
        className="user-search-filter"
        key={user._id || index}
        onClick={() => (hasChat ? openChat(user._id) : startNewChat(user._id))}
      >
        <div className={isSelectedChat(user) ? "selected-user" : "filtered-user"}>
          <div className="filter-user-display">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile Pic"
                className="user-profile-image"
                style={onlineUser.includes(user._id) ? { border: "#82e0aa 3px solid" } : {}}
              />
            ) : (
              <div
                className={isSelectedChat(user) ? "user-selected-avatar" : "user-default-avatar"}
                style={onlineUser.includes(user._id) ? { border: "#82e0aa 3px solid" } : {}}
              >
                {user?.firstname?.charAt(0)?.toUpperCase()}
                {user?.lastname?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div className="filter-user-details">
              <div className="user-display-name">{formatName(user)}</div>
              <div className="user-display-email">{getLastMessage(user._id) || user?.email}</div>
            </div>

            <div>
              {getUnreadMessageCount(user._id)}
              <div className="last-message-timestamp">{getLastMessageTimeStamp(user._id)}</div>
            </div>

            {!hasChat && (
              <div className="user-start-chat">
                <button
                  className="user-start-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewChat(user._id);
                  }}
                >
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
}

export default UsersList;
