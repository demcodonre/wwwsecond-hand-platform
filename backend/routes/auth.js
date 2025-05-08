const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { validateRegister, validateLogin } = require('../middleware/validation'); // 新增验证中间件

// 用户注册
router.post('/register', validateRegister, authController.register);

// 用户登录 
router.post('/login', validateLogin, authController.login);

module.exports = router;