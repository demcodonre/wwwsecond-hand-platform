const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: '请提供认证令牌' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 检查用户角色
    const User = require('../models/User');
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权访问此资源' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, message: '认证失败，请重新登录' });
  }
};