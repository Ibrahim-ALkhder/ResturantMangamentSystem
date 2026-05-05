import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  // Use PostgreSQL for production (Render provides free PostgreSQL)
  // Falls back to SQLite for local development
  dialect: process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite',
  
  // PostgreSQL config (used on Render)
  ...(process.env.NODE_ENV === 'production' && {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
  
  // SQLite config (used locally)
  ...(process.env.NODE_ENV !== 'production' && {
    storage: './database.sqlite',
  }),
  
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;