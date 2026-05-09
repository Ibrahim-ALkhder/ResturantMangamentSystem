import { io } from 'socket.io-client';

export const createSocket = (token) => {
  // تحديد الرابط: يستخدم الرابط المرفوع في الإنتاج، و localhost في التطوير المحلي
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://alshatibi-backend.onrender.com';

  return io(SOCKET_URL, {
    auth: { token },
    // إعدادات النقل الحصري لضمان عمل السوكت على Render المجاني
    transports: ['websocket', 'polling'], 
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity, // يحاول الاتصال للأبد في حال انقطع السيرفر
    reconnectionDelay: 2000,
  });
};
