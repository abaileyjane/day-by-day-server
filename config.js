exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://user1:user1@ds151558.mlab.com:51558/day-by-day'
exports.PORT = process.env.PORT || 8080;
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://user1:user1@ds151508.mlab.com:51508/day-by-day-testing'
exports.TEST_PORT = process.env.PORT || 7070;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';



