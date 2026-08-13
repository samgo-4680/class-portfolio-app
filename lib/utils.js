export function normalizeCode(value = '') {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizeStudentNumber(value = '') {
  return value.trim().replace(/\s+/g, '');
}

export function validPassword(value = '') {
  return typeof value === 'string' && value.length >= 4;
}

export function randomClassCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function formatKoreanDate(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}
