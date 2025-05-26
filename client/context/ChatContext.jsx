import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import React, { useState, useContext, useEffect, createContext } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios } = useContext(AuthContext);

  // function to get all users for sidebar
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/allUsers");
      if (data.success) {
        setAllUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.messages);
    }
  };
  // Call api các users đã nhắn tin
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
        console.log("Users from server:", data.users);
      }
    } catch (error) {
      toast.error(error.messages);
    }
  };
  //   function to get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.message);
        console.log(data.message);
      }
    } catch (error) {
      toast.error(error.messages);
    }
  };
  //   function to send message to selected user
  const sendMessages = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((preMessage) => [...preMessage, data.newMessage]);
        getUsers();
      } else {
        toast.error(data.messages);
      }
    } catch (error) {
      toast.error(error.messages);
    }
  };
  // function delete messages
  const deleteMessages = async (userId) => {
    try {
      const { data } = await axios.delete(`/api/messages/delete/${userId}`);
      if (data.success) {
        await getAllUsers();
        await getUsers();
        await getMessages(userId);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  // function to subscribe to message for selected use
  const subscribeToMessages = async () => {
    // Nếu socket chưa được khởi tạo, thì không thực hiện gì cả
    if (!socket) {
      return;
    }

    // Đăng ký lắng nghe sự kiện 'newMessage' từ server gửi qua socket
    socket.on("newMessage", (newMessage) => {
      // Nếu đang chọn đúng người đang gửi tin nhắn (tức là đang mở hộp thoại chat với họ)
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        // Đánh dấu tin nhắn là đã xem (chỉ ở phía client)
        newMessage.seen = true;

        // Cập nhật danh sách tin nhắn hiện tại bằng cách thêm tin mới vào cuối mảng
        setMessages((prevMessage) => [...prevMessage, newMessage]);

        // Gửi yêu cầu lên server để đánh dấu tin nhắn này là đã xem trong cơ sở dữ liệu
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        // Nếu không phải là người đang được chọn (tức là chưa mở cuộc trò chuyện)
        // => Cập nhật số lượng tin nhắn chưa đọc (unseen) của người gửi đó
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1 // Nếu đã có -> tăng lên 1
            : 1, // Nếu chưa có -> bắt đầu từ 1
        }));
      }
      getUsers();
    });
  };
  // function to unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
    }
  };
  useEffect(() => {
    // Kết nối và lắng nghe tin nhắn mới từ socket khi component được mount
    subscribeToMessages();
    // Gỡ bỏ listener khi component unmount (rời khỏi giao diện)
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);
  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    setMessages,
    sendMessages,
    setUsers,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getAllUsers,
    allUsers,
    setAllUsers,
    deleteMessages,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
