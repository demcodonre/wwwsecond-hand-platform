const { body, validationResult } = require('express-validator');

exports.validateRegister = [
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 16 }).withMessage('用户名长度必须在3-16个字符之间'),
  
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
    
  body('email')
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('请输入有效的邮箱地址'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        code: 400,
        errors: errors.array(),
        message: '参数验证失败'
      });
    }
    next();
  }
];

exports.validateLogin = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        code: 400,
        errors: errors.array(),
        message: '参数验证失败'
      });
    }
    next();
  }
];