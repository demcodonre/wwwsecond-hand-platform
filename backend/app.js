const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const productRouter = require('./routes/product');
const uploadRouter = require('./routes/upload')

const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/user/posts', authMiddleware, postRoutes);
app.use('/api/products', productRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', require('./routes/admin'));
// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      code: 400, 
      message: err.message || '文件上传错误' 
    });
  } else if (err) {
    return res.status(500).json({ 
      code: 500, 
      message: err.message || '服务器内部错误' 
    });
  }
  
  next();
});

module.exports = app; 