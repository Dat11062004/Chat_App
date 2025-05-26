// Hàm formatMessageTime nhận vào một chuỗi ngày giờ (date) và trả về giờ phút đã được định dạng
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    // Sử dụng định dạng 24 giờ (vd: 14:05 thay vì 2:05 PM)
    hour12: false,
  });
}
