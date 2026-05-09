// الجزء رقم 5 في ملف server.js - انسخ ده بالظبط
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('📦 Connected to PostgreSQL successfully');

    // السطر ده هو اللي بيثبت البيانات:
    // force: false -> مستحيل يمسح الجداول
    // alter: false -> مستحيل يعدل الجداول ويمسح اللي فيها
    await sequelize.sync({ force: false, alter: false });
    
    console.log('✅ Database is Locked and Stable. No data will be lost.');

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }
};

startServer();
