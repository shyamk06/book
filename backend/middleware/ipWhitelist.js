const whitelist = process.env.ADMIN_IP_WHITELIST.split(',');

exports.ipWhitelist = (req, res, next) => {
  const clientIP = req.ip || 
                  req.headers['x-forwarded-for'] || 
                  req.connection.remoteAddress;

  // Allow localhost in development
  if (process.env.NODE_ENV === 'development' && 
      ['::1', '127.0.0.1'].includes(clientIP)) {
    return next();
  }

  if (!whitelist.includes(clientIP)) {
    return res.status(403).json({ 
      success: false,
      error: `IP ${clientIP} not authorized for admin access`
    });
  }

  next();
};