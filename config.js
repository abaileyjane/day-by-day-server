exports.DATABASE_URL = process.env.DATABASE_URL || ''
exports.PORT = process.env.PORT || 8080;
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://user1:user1@ds151508.mlab.com:51508/day-by-day-testing'
exports.TEST_PORT = process.env.PORT || 7070;
exports.JWT_SECRET = process.env.JWT_SECRET || 'alanna';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.CLIENT_ORIGIN= process.env.CLIENT_ORIGIN || 'https://day-by-day.netlify.com/'




