const express = require('express');
const router = express.Router();
const postController = require('../controllers/post');
const auth = require('../middleware/auth');
const multer = require('multer');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts');
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}.${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 获取用户帖子
router.get('/', auth, postController.getUserPosts);

// 创建帖子
router.post('/', auth, upload.array('images', 5), postController.createPost);

// 更新帖子
router.put('/:id', auth, postController.updatePost);

// 删除帖子
router.delete('/:id', auth, postController.deletePost);

module.exports = router;