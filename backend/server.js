import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
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

// التأكد من وضع الإنتاج
const isProduction = process.env.NODE_ENV === 'production';

// 1. إعدادات CORS
app.use(cors({
  origin: [
    'https://alshatibi-customer.onrender.com', 
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. مجلد الرفع
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// 3. المسارات
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/driver', driverRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'
  });
});

// 4. Socket.io
const io = initSocket(httpServer);
app.set('io', io);
app.use('/api/orders', orderRoutes(io));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// 5. تشغيل السيرفر والمزامنة الآمنة لقاعدة البيانات
const startServer = async () => {
  try {
    // محاولة الاتصال
    await sequelize.authenticate();
    
    // طباعة نوع القاعدة المتصل بها في الـ Logs لضمان الشفافية
    const dbSource = process.env.DATABASE_URL ? 'PostgreSQL (Render)' : 'SQLite (Local File)';
    console.log(`📦 Database Source: ${dbSource}`);

    /**
     * الحل النهائي لمشكلة مسح البيانات:
     * في الـ Production نمنع Sequelize تماماً من لمس هيكل الجداول.
     * force: false -> لا تحذف الجداول أبداً.
     * alter: false -> لا تعدل الأعمدة تلقائياً (يحمي من مسح البيانات عند حدوث تعارض).
     */
    const syncOptions = isProduction 
      ? { force: false, alter: false } 
      : { force: false, alter: true };

    await sequelize.sync(syncOptions);
    
    console.log('✅ Database connected and synchronized safely.');

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ DB connection error:', err);
    // إذا فشل الاتصال بقاعدة البيانات الخارجية، لا نريد تشغيل السيرفر ببيانات محلية مؤقتة
    process.exit(1);
  }
};

startServer();
