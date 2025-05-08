const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      '物品/教材',
      '物品/电子外设',
      '物品/运动器材',
      '物品/宿舍用品',
      '信息/家教',
      '信息/租房',
      '信息/兼职',
      '代替/代抄',
      '代替/代课',
      '代替/代写',
      '代替/快递代取',
      '代替/刷课',
      '失物/校园卡',
      '失物/其他',
      '宝藏/电子教材',
      '宝藏/考试资料'
    ]
  },
  images: [{
    type: String,
    required: true
  }],
  contact: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'removed'],
    default: 'available'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间戳
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);