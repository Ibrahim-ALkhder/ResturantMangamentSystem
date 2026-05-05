import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs'; // أضفنا هذا للتأكد من وجود مجلد الرفع
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import './models/index.js'; 
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { initSocket } from './socket/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. إعدادات CORS المحسنة
app.use(cors({
  origin: [
    'https://alshatibi-customer.onrender.com', 
    'http://localhost:5173' // للسماح بالتطوير المحلي أيضاً
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. التأكد من وجود مجلد uploads (مهم جداً لـ Render)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// 3. تعريف المسارات (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/driver', driverRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV });
});

// 4. إعداد Socket.io
const io = initSocket(httpServer);
app.set('io', io);
app.use('/api/orders', orderRoutes(io));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// 5. الاتصال بقاعدة البيانات والتشغيل
sequelize.authenticate()
  .then(() => {
    // سيطبع نوع قاعدة البيانات المتصل بها للتأكد
    console.log(`📦 Database connected (${process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'SQLite'})`);
    return sequelize.sync({ alter: true }); // تحديث الجداول تلقائياً
  })
  .then(() => {
    httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection error:', err);
    process.exit(1); // إغلاق التطبيق إذا فشل الاتصال بالقاعدة
  });
