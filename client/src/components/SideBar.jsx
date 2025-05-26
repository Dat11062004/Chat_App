import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const SideBar = ({ detailUser }) => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    messages,
    allUsers,
    getAllUsers,
    deleteMessages,
  } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDelete, setIsDelete] = useState(null);
  // const [isPcMenuOpen, setPcMenuOpen] = useState(window.innerWidth >= 1280);
  const [input, setInput] = useState(false);
  const navigate = useNavigate();
  // Lọc người dùng theo tìm kiếm
  const filteredUsers = input
    ? allUsers.filter((user) =>
        user.fullname.toLowerCase().includes(input.toLowerCase())
      )
    : users;
  useEffect(() => {
    getUsers();
  }, [onlineUsers, messages]);
  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    // max-md:hidden để khi mà click vào 1 tin nhắn của 1 ng dùng nào đó gửi đến thì:
    // + nếu màn hình <=768px thì sẽ ẩn phần sidebar chỉ hiển thị phần tin nhắn
    // + nếu màn hình >768px thì sẽ hiển thị bình thường
    <div
      className={`bg-[#818582]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-xl:hidden" : ""
      } ${detailUser ? "max-xl:block" : "max-xl:hidden"}`}
    >
      <div className="pb-5">
        {/* Logo và thanh menu hiển thị*/}
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40 w-20" />
          <div className="relative py-2 ">
            <img
              onClick={() => {
                setMenuOpen((prev) => !prev);
              }}
              src={assets.menu_icon}
              alt="logo"
              className="max-h-5 cursor-pointer"
            />
            <div
              className={`absolute top-full dropdown-menu right-0 pt-4 z-0 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 ${
                isMenuOpen ? "block" : "hidden"
              }
              }`}
            >
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p
                onClick={() => {
                  setSelectedUser(null);
                  logout();
                }}
                className="cursor-pointer text-sm"
              >
                Logout
              </p>
            </div>
          </div>
        </div>
        {/* Search user */}
        <div className="flex items-center gap-2 bg-gray-500 rounded-full py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => {
              setInput(e.target.value);
              setSelectedUser(null); // reset user đang chọn
            }}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
        {/* display user gửi tin nhắn đến */}
        {/* Cú pháp aspect-[x/y] là cú pháp tuỳ chỉnh tỷ lệ khung hình trong Tailwind CSS.

aspect-[1/1] nghĩa là chiều rộng và chiều cao bằng nhau, tức là một hình vuông. */}
        <div className="flex flex-col mt-8 ">
          {filteredUsers.map((user, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedUser(user),
                  setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
              }}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
                selectedUser?._id === user._id && "bg-[#281]/50"
              }`}
            >
              <img
                src={user?.profilePic || assets.avatar_icon}
                alt=""
                className="w-[35px] aspect-[1/1] rounded-full"
              />
              <div className="flex flex-col leading-5">
                <p>{user.fullname}</p>
                {onlineUsers.includes(user._id) ? (
                  <span className="text-green-400 text-xs">Online</span>
                ) : (
                  <span className="text-neutral-400 text-xs">Offline</span>
                )}
              </div>
              {unseenMessages[user._id] > 0 && (
                <p className="absolute top-5 right-8 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                  {unseenMessages[user._id]}
                </p>
              )}
              <div className="absolute top-5 right-1">
                <img
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn sự kiện lan ra cha nếu cần
                    setIsDelete(isDelete === user._id ? null : user._id);
                  }}
                  src={assets.menu_icon}
                  alt=""
                  className="max-h-5 cursor-pointer"
                />
                <div
                  className={`absolute top-full right-0 z-1 w-25 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 ${
                    isDelete === user._id ? "block" : "hidden"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      // Ngăn chặn click lan truyền
                      e.stopPropagation();

                      deleteMessages(user._id);
                      setSelectedUser(null);
                    }}
                    className="cursor-pointer text-sm flex items-center gap-1 "
                  >
                    <svg
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16" // chiều rộng
                      height="16" // chiều cao
                      fill="currentColor" // màu theo text color
                    >
                      <title>Delete</title>
                      <g data-name="Layer 9" id="Layer_9">
                        <path d="M26,5.78H20.57V4.94a2.11,2.11,0,0,0-2.1-2.1H13.54a2.11,2.11,0,0,0-2.1,2.1v.85H6a.5.5,0,0,0,0,1H7.72v19a2.94,2.94,0,0,0,2.94,2.94H21.34a2.94,2.94,0,0,0,2.94-2.94v-19H26a.5.5,0,0,0,0-1ZM12.43,4.94a1.11,1.11,0,0,1,1.1-1.1h4.93a1.11,1.11,0,0,1,1.1,1.1v.85H12.43ZM23.28,25.81a1.94,1.94,0,0,1-1.94,1.94H10.66a1.94,1.94,0,0,1-1.94-1.94v-19H23.28Z" />
                        <path d="M16,9.44a.5.5,0,0,0-.5.5V24.36a.5.5,0,0,0,1,0V9.94A.5.5,0,0,0,16,9.44Z" />
                        <path d="M20.88,24.86a.5.5,0,0,0,.5-.5V9.94a.5.5,0,1,0-1,0V24.36A.5.5,0,0,0,20.88,24.86Z" />
                        <path d="M11.12,9.44a.5.5,0,0,0-.5.5V24.36a.5.5,0,0,0,1,0V9.94A.5.5,0,0,0,11.12,9.44Z" />
                      </g>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
