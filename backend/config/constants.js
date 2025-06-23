module.exports = {
  ROLES: {
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
  },
  JWT_SECRET: process.env.JWT_SECRET || 'your_fallback_secret',
  JWT_EXPIRE: '24h'
};