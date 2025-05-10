const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const auth = require('../middleware/auth');
const multer = require('multer');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}.${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 获取用户信息
router.get('/profile', auth, userController.getProfile);

// 更新用户信息
router.put('/profile', auth, userController.updateProfile);

// 上传头像
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);

// 修改密码
router.patch('/password', auth, userController.changePassword);

module.exports = router;