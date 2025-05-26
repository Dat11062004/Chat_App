import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    // type: mongoose.Schema.Types.ObjectId: kiểu dữ liệu là ObjectId, để liên kết (relationship) tới một tài liệu khác.
    // ref: "User": tạo mối liên kết (reference) đến model User, tức là senderId sẽ trỏ đến _id của một User.
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String },
    image: { type: String },
    deleteBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    seen: { type: Boolean, default: false },
  },
  //   Tùy chọn { timestamps: true } sẽ tự động tạo và cập nhật 2 trường:

  // createdAt: thời điểm tạo tin nhắn.

  // updatedAt: thời điểm cập nhật tin nhắn gần nhất.
  { timestamps: true }
);
const Message = mongoose.model("Message", messageSchema);
export default Message;
