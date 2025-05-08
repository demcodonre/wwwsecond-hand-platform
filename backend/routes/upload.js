const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const path = require('path')

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/products'))
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop()
    cb(null, `${Date.now()}.${ext}`)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传图片文件'), false)
    }
  }
})

router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: '请上传文件'
    })
  }

  // 返回相对路径
  const filePath = `/uploads/products/${req.file.filename}`;
  
  res.json({
    code: 200,
    message: '文件上传成功',
    data: {
      url: filePath
    }
  })
})

module.exports = router