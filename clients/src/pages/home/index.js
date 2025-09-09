import { useSelector, shallowEqual } from "react-redux";
import ChatArea from "./components/chat";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("https://chatsphere-server-kops.onrender.com");

function Home() {
  const { selectedChat, user } = useSelector(
    state => ({
      selectedChat: state.user.selectedChat,
      user: state.user.user
    }),
    shallowEqual
  );

  const [onlineUser, setOnlineUser] = useState([]);

  useEffect(() => {
    if (!user) return;

    socket.emit("join-room", user._id);
    socket.emit("user-login", user._id);

    socket.on("online-users", (onlineusers) => setOnlineUser(onlineusers));
    socket.on("online-users-updated", (onlineusers) => setOnlineUser(onlineusers));

    return () => {
      socket.off("online-users");
      socket.off("online-users-updated");
    };
  }, [user]);

  return (
    <div className="home-page">
      <Header socket={socket} />
      <div className="main-content">
        <Sidebar socket={socket} onlineUser={onlineUser} />
        {selectedChat && <ChatArea socket={socket} />}
      </div>
    </div>
  );
}

export default Home;
