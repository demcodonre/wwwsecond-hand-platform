const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    default: '新用户'
  },
  avatar: {
    type: String,
    default: ''
  },
  qq: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: '',
    match: [/.+\@.+\..+/, '请输入有效的邮箱']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 添加更新时间戳的中间件
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);