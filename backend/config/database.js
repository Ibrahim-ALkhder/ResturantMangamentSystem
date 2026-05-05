import { Sequelize } from 'sequelize';
import Database from 'better-sqlite3';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
  dialectModule: Database,
});

export default sequelize;