import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: [
    'https://alshatibi-customer.onrender.com',
    'https://alshatibi-web.onrender.com',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbError = null;
let modulesLoaded = false;

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', dbError, modulesLoaded });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});

process.on('uncaughtException', (err) => console.error('[FATAL]', err));
process.on('unhandledRejection', (reason) => console.error('[FATAL]', reason));

setTimeout(async () => {
  try {
    const sequelize = (await import('./config/database.js')).default;
    await import('./models/index.js');
    const authRoutes = (await import('./routes/authRoutes.js')).default;
    const categoryRoutes = (await import('./routes/categoryRoutes.js')).default;
    const menuRoutes = (await import('./routes/menuRoutes.js')).default;
    const userRoutes = (await import('./routes/userRoutes.js')).default;
    const driverRoutes = (await import('./routes/driverRoutes.js')).default;
    const orderRoutes = (await import('./routes/orderRoutes.js')).default;
    const { errorHandler } = await import('./middleware/errorMiddleware.js');
    const { initSocket } = await import('./socket/index.js');

    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadDir));

    app.use('/api/auth', authRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/driver', driverRoutes);

    const io = initSocket(httpServer);
    app.set('io', io);
    app.use('/api/orders', orderRoutes(io));

    app.use(errorHandler);

    try {
      await sequelize.authenticate();
      console.log('Database connected');
      await sequelize.sync({ force: false, alter: false });
      console.log('Database synced');

      // Seed admin user if not exists
      const { default: User } = await import('./models/User.js');
      const adminExists = await User.findOne({ where: { email: 'admin@alshatibi.com' } });
      if (!adminExists) {
        await User.create({
          name: 'مدير النظام',
          email: 'admin@alshatibi.com',
          password: '123456',
          phone: '0100000000',
          role: 'admin',
        });
        console.log('Admin user created');
      }

      modulesLoaded = true;
    } catch (dbErr) {
      dbError = dbErr.message;
      console.error('DB init error:', dbErr.message);
    }
  } catch (err) {
    dbError = err.message;
    console.error('Module loading error:', err.message);
  }
}, 100);
