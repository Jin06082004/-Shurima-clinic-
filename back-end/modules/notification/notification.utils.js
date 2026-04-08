/**
 * Tiện ích tạo thông báo.
 * Import vào bất kỳ service nào cần gửi thông báo.
 */
const Notification = require('../notification/notification.model');

/**
 * Gửi thông báo tới một user.
 * @param {object} opts
 * @param {string} opts.userId       — _id User nhận thông báo
 * @param {string} opts.type         — loại thông báo
 * @param {string} opts.title        — tiêu đề
 * @param {string} opts.message      — nội dung
 * @param {string} [opts.appointmentId] — _id Appointment liên kết (tùy chọn)
 */
async function notify({ userId, type, title, message, appointmentId = null }) {
  return Notification.create({
    userId,
    type,
    title,
    message,
    appointmentId,
  });
}

/**
 * Gửi thông báo cho NHIỀU user cùng lúc.
 * @param {Array} users  — mảng userId string
 * @param {object} opts   — giống notify()
 */
async function notifyMany(userIds, opts) {
  const docs = userIds.map((userId) => ({
    userId,
    type: opts.type,
    title: opts.title,
    message: opts.message,
    appointmentId: opts.appointmentId || null,
  }));
  return Notification.insertMany(docs);
}

module.exports = { notify, notifyMany };