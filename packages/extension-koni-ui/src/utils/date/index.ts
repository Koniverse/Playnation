// [object Object]
// SPDX-License-Identifier: Apache-2.0
const formatDate = (date: Date, isEndDay: boolean) => {
  const year = date.getFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
  const day = String(date.getUTCDate()).padStart(2, '0');
  const time = isEndDay ? '23:59:59' : '00:00:00';

  return `${year}-${month}-${day} ${time}`;
};

export const formatDateFully = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const formatFully = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

function getLastDayOfMonth (year: number, month: number): Date {
  const nextMonth = new Date(Date.UTC(year, month + 1, 1));

  nextMonth.setUTCDate(nextMonth.getUTCDate() - 1);

  return nextMonth;
}

function getLastDayOfYear (year: number): Date {
  const nextYearStart = new Date(Date.UTC(year + 1, 0, 1)); // Ngày đầu năm sau theo UTC

  nextYearStart.setUTCDate(nextYearStart.getUTCDate() - 1); // Trừ đi 1 ngày để được ngày cuối năm hiện tại

  return nextYearStart;
}

export function calculateStartAndEnd (key: string) {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const day = today.getUTCDate();

  switch (key) {
    case 'weekly': {
      const dayOfWeek = today.getUTCDay(); // 0 (Chủ Nhật) đến 6 (Thứ Bảy)
      const start = new Date(Date.UTC(year, month, day - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))); // Adjust if today is Sunday
      const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6));

      return { start: formatDate(start, false), end: formatDate(end, true) };
    }

    case 'monthly': {
      const startOfMonth = new Date(Date.UTC(year, month, 1));
      const endOfMonth = getLastDayOfMonth(year, month);

      return { start: startOfMonth, end: formatDate(endOfMonth, true) };
    }

    case 'yearly': {
      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const endOfYear = getLastDayOfYear(year);

      return { start: startOfYear, end: formatDate(endOfYear, true) };
    }

    case 'karura_playdrop': {
      const startEnv = process.env.KARURA_PLAYDROP_START_DATE || '2024-06-01 03:00:00' as string;
      const endEnv = process.env.KARURA_PLAYDROP_END_DATE || '2024-06-15 00:00:00' as string;
      const startDate = new Date(startEnv);
      const endDate = new Date(endEnv);

      return { start: formatFully(startDate), end: formatFully(endDate) };
    }

    case 'ded_playdrop': {
      const startEnv = process.env.DED_PLAYDROP_START_DATE || '2024-06-26 03:00:00' as string;
      const endEnv = process.env.DED_PLAYDROP_END_DATE || '2024-07-10 03:00:00' as string;
      const startDate = new Date(startEnv);
      const endDate = new Date(endEnv);

      return { start: formatFully(startDate), end: formatFully(endDate) };
    }

    case 'vara_playdrop': {
      const startEnv = process.env.VARA_PLAYDROP_START_DATE || '2024-07-10 10:00:00' as string;
      const endEnv = process.env.VARA_PLAYDROP_END_DATE || '2024-07-31 10:00:00' as string;
      const startDate = new Date(startEnv);
      const endDate = new Date(endEnv);

      return { start: formatFully(startDate), end: formatFully(endDate) };
    }

    case 'invite_to_play': {
      const dayOfWeek = today.getUTCDay(); // 0 (Chủ Nhật) đến 6 (Thứ Bảy)
      const start = new Date(Date.UTC(year, month, day - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))); // Adjust if today is Sunday
      const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6));

      return { start: formatDate(start, false), end: formatDate(end, true) };
    }

    default:
      throw new Error('Invalid key. Must be "weekly", "monthly", or "yearly".');
  }
}
