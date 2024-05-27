// [object Object]
// SPDX-License-Identifier: Apache-2.0
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export function calculateStartAndEnd (key: string) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  switch (key) {
    case 'weekly': {
      const dayOfWeek = today.getDay(); // 0 (Chủ Nhật) đến 6 (Thứ Bảy)
      const start = new Date(year, month, day - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Điều chỉnh nếu hôm nay là Chủ Nhật
      const end = new Date(year, month, start.getDate() + 6);

      return { start: formatDate(start), end: formatDate(end) };
    }

    case 'monthly': {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0); // Ngày 0 của tháng sau là ngày cuối cùng của tháng này

      return { start: formatDate(start), end: formatDate(end) };
    }

    case 'yearly': {
      const start = new Date(year, 0, 1); // 1 tháng 1
      const end = new Date(year + 1, 0, 0); // 31 tháng 12

      return { start: formatDate(start), end: formatDate(end) };
    }

    default:
      throw new Error('Invalid key. Must be "weekly", "monthly", or "yearly".');
  }
}
