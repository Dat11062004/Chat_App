import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSideBar = ({ detailUser, setDetailUser }) => {
  const { setSelectedUser, selectedUser, messages } = useContext(ChatContext);
  const { onlineUsers, logout } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);
  // Get all the images from messages and set them to state
  useEffect(() => {
    //  Lọc ra các tin nhắn có chứa hình ảnh, sau đó lấy ra chỉ phần ảnh từ mỗi tin nhắn
    setMsgImages(
      // Bước 1: Chỉ giữ lại những tin nhắn có thuộc tính image
      // Bước 2: Lấy giá trị image từ mỗi tin nhắn
      messages.filter((message) => message.image).map((msg) => msg.image)
    );
  }, [messages]);
  return (
    selectedUser && (
      <div
        className={`bg-[#8185B2]/10 text-white  relative overflow-y-scroll justify-center w-full mx-auto ${
          selectedUser ? "xl:block" : "xl:hidden"
        } ${!detailUser ? "max-xl:block" : "max-xl:hidden"}`}
      >
        {/* top */}
        <div className="pt-16 flex flex-col justify-center items-center gap-2 text-xs font-light relative">
          <img
            src={assets.arrow_icon}
            alt=""
            className={`w-5 xl:hidden absolute left-2 top-2`}
            onClick={() => {
              if (window.innerWidth < 1280) {
                setDetailUser((prev) => !prev);
              }
            }}
          />
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-20 h-20 object-cover aspect-[1/1] rounded-full"
          />
          <div className="px-10 text-xl font-medium  justify-center flex no-wrap items-center gap-2 ">
            <p
              className={`w-2 h-2 rounded-full ${
                onlineUsers.includes(selectedUser._id)
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            ></p>
            <p className="text-center whitespace-nowrap">
              {selectedUser.fullname}
            </p>
          </div>
          <p className="px-10 mx-auto text-center">{selectedUser.bio}</p>
        </div>
        <hr className="border-[#ffffff50] my-4" />
        {/* media */}
        <div className="px-5 text-xs">
          <p>Media</p>
          <div className="mt-2 xl:max-h-[230px] max-xl:max-h-[450px] max-lg:max-h-[600px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {msgImages.map((url, index) => (
              <div
                className="cursor-pointer rounded "
                key={index}
                onClick={() => window.open(url)}
              >
                <img
                  src={url}
                  alt=""
                  className="h-full rounded-md object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        {/* button */}
        <button
          onClick={() => {
            setSelectedUser(null);
            logout();
          }}
          className=" transform left-1/2  -translate-x-1/2  cursor-pointer absolute text-sm py-2 px-20 bottom-1 bg-violet-600 hover:bg-blue-300 rounded-full"
        >
          Logout
        </button>
      </div>
    )
  );
};

export default RightSideBar;
