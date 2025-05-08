const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 用户注册
exports.register = async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // 验证输入
      if (!username || !password || !email) {
        return res.status(400).json({ code: 400, message: '请填写所有必填字段' });
      }
      
      // 用户名规则验证
      if (username.length < 3 || username.length > 16) {
        return res.status(400).json({ code: 400, message: '用户名长度应在3-16个字符之间' });
      }
      
      // 密码强度验证
      if (password.length < 6) {
        return res.status(400).json({ code: 400, message: '密码长度不能少于6位' });
      }
      
      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ code: 400, message: '请输入有效的邮箱地址' });
      }
      
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ code: 400, message: '用户名已存在' });
      }
      
      // 检查邮箱是否已存在
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ code: 400, message: '邮箱已被注册' });
      }
      
      // 创建用户
      const user = new User({ username, password, email });
      await user.save();
      
      // 生成token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      res.status(201).json({ 
        code: 201, 
        message: '注册成功',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt
          }
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ code: 500, message: '服务器错误，注册失败' });
    }
  };

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '请填写用户名和密码' });
    }
    
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ code: 400, message: '密码错误' });
    }
    
    // 生成token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ 
      code: 200, 
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          nickname: user.nickname
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '登录失败' });
  }
};