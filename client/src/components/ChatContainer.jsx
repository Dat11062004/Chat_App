import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../libray/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = ({ detailUser, setDetailUser }) => {
  const { messages, selectedUser, setSelectedUser, sendMessages, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  // Tạo một ref để tham chiếu đến phần tử DOM cuối cùng trong danh sách (thường dùng để cuộn xuống cuối trong chat)
  const scrollEnd = useRef();
  /*
  useEffect này sẽ chạy 1 lần sau khi component render lần đầu (vì dependency array là rỗng []).
  Nếu phần tử DOM được gắn với ref scrollEnd tồn tại, ta gọi scrollIntoView để cuộn xuống vị trí đó.
  behavior: "smooth" giúp cuộn một cách mượt mà (smooth scroll), tạo trải nghiệm người dùng tốt hơn.
*/
  const [input, setInput] = useState("");
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") {
      return null;
    }
    await sendMessages({ text: input.trim() });
    setInput("");
  };
  // Handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file!");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      await sendMessages({ image: reader.result });
      e.target.value = "";
    };
  };

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return selectedUser ? (
    <div
      className={`h-full overflow-y-scroll overflow-x-hidden scroll-smooth relative backdrop-blur-lg ${
        detailUser ? "max-xl:block" : "max-xl:hidden"
      }`}
    >
      {/* Hiển thị tên người gửi phía trên */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500 ">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 h-8 object-cover rounded-full"
        />
        <p
          onClick={() => {
            if (window.innerWidth < 1280) {
              setDetailUser((prev) => !prev);
            }
          }}
          className="flex-1 text-lg text-white flex items-center gap-2 max-xl:cursor-pointer"
        >
          {selectedUser.fullname}
          {onlineUsers.includes(selectedUser._id) ? (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="xl:hidden max-w-7"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>
      {/* Chat */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll overflow-x-hidden scroll-smooth p-3 pb-6">
        {/* Hiển thị các tin nhắn */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            {msg.image ? (
              <img
                onClick={() => window.open(msg.image)}
                src={msg.image}
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all  text-white ${
                  msg.senderId === authUser._id
                    ? "rounded-br-none bg-blue-500/30"
                    : "rounded-bl-none bg-orange-500/30"
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                className="rounded-full w-7 h-7 object-cover"
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
              />
              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>
      {/* form gửi tin nhắn và nhập tin nhắn hình ảnh */}
      <div className="absolute z-1 bottom-0 left-0 right-0 flex  items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
            type="text"
            placeholder="Send a message"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png,image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          className="w-7 cursor-pointer"
          src={assets.send_button}
          alt=""
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat anytime,anywhere</p>
    </div>
  );
};

export default ChatContainer;
