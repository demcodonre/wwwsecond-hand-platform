require('dotenv').config(); // 在第一行添加
const app = require('./app');
const connectDB = require('./config/db');
// const uploadRouter = require('./routes/upload')
// 连接数据库
connectDB();
// app.use('/api/upload', uploadRouter)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
