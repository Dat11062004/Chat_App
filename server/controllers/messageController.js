import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
// Lấy ra all users trong db
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    //     Tìm tất cả người dùng ngoại trừ người đang đăng nhập bằng toán tử $ne (not equal).
    // ✅ .select("-password"): loại bỏ trường password khi trả về (để bảo mật).
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    // count number of messages not seen
    const unseenMessages = {};
    // Truy vấn tất cả tin nhắn mà:

    // sender là user._id (người kia)

    // receiverId là userId (người đang đăng nhập)

    // seen: false (tin nhắn chưa đọc)
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    // Chờ tất cả các truy vấn trong map() chạy xong trước khi tiếp tục.
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.messages);
    res.json({ success: false, messages: error.messages });
  }
};
// Lấy ra các ng dùng đã nhắn tin để hiển thị
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy tất cả tin nhắn bạn từng tham gia, và bạn chưa xóa
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      deleteBy: { $nin: [userId] }, // lọc tin nhắn bạn chưa xóa
    });

    // 2. Lấy danh sách userId bên kia
    const userIds = new Set();

    messages.forEach((msg) => {
      if (msg.senderId.toString() !== userId.toString()) {
        userIds.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== userId.toString()) {
        userIds.add(msg.receiverId.toString());
      }
    });

    // 3. Lấy thông tin người dùng từ các userId này
    const filteredUsers = await User.find({
      _id: { $in: Array.from(userIds) },
    }).select("-password");

    // 4. Đếm tin nhắn chưa đọc từ từng người
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    console.log("myId (from req.user._id):", myId);
    console.log("selectedUserId (from req.params.id):", selectedUserId);

    const message = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
      deleteBy: { $nin: [myId] },
    }).sort({ createdAt: 1 }); // sắp xếp tăng dần theo thời gian gửi

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true },
      { deleteBy: { $nin: [myId] } }
    );
    res.json({ success: true, message });
  } catch (error) {
    console.log(error.messages);
    res.json({ success: false, messages: error.messages });
  }
};

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.messages);
    res.json({ success: false, messages: error.messages });
  }
};
// send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    // emit the new message to the receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.messages);
    res.json({ success: false, messages: error.messages });
  }
};
// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: selectedUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: userId },
      ],
    });
    const updatePromise = messages.map((message) => {
      if (!message.deleteBy.includes(userId)) {
        message.deleteBy.push(userId);
        return message.save();
      }
      return null;
    });
    // Đợi tất cả cập nhật xong
    await Promise.all(updatePromise);
    // Xóa vĩnh viễn nếu cả hai người dùng đều đã xóa
    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: userId },
      ],
      deleteBy: { $all: [userId, selectedUserId] }, // chứa cả 2 id
    });
    res.json({ success: true, messages, message: "Deleted successfully!" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
