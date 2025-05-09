require('dotenv').config(); 
const app = require('./app');
const connectDB = require('./config/db');

// 连接数据库
connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
