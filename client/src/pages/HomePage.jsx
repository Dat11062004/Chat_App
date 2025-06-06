import React, { useContext, useState } from "react";
import SideBar from "../components/SideBar";
import ChatContainer from "../components/ChatContainer";
import RightSideBar from "../components/RightSideBar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);
  const [detailUser, setDetailUser] = useState(true);
  return (
    <div className="border w-full h-screen xl:px-[15%] xl:py-[5%]">
      <div
        className={`grid  relative h-[100%] overflow-hidden rounded-2xl border-gray-600 backdrop-blur-sm ${
          selectedUser
            ? "max-xl:grid-cols-1 xl:grid-cols-[1fr_2fr_1fr] "
            : "md:grid-cols-2"
        }`}
      >
        <SideBar detailUser={detailUser} setDetailUser={setDetailUser} />
        <ChatContainer detailUser={detailUser} setDetailUser={setDetailUser} />
        <RightSideBar detailUser={detailUser} setDetailUser={setDetailUser} />
      </div>
    </div>
  );
};

export default HomePage;
