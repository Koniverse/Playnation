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

    case 'karura_playdrop': {
      const startEnv = process.env.KARURA_PLAYDROP_START_DATE as string;
      const endEnv = process.env.KARURA_PLAYDROP_END_DATE as string;
      const startDate = new Date(startEnv);
      const endDate = new Date(endEnv);

      return { start: formatDate(startDate), end: formatDate(endDate) };
    }

    default:
      throw new Error('Invalid key. Must be "weekly", "monthly", or "yearly".');
  }
}
