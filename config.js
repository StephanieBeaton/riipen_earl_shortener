var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/earl-shortener';

module.exports = connectionString;
