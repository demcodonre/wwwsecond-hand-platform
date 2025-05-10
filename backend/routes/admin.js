const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const adminAuth = require('../middleware/admin');

// 管理员获取所有物品
router.get('/products', adminAuth, async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('owner', 'username avatar');
    
    res.json({
      code: 200,
      data: products
    });
  } catch (error) {
    console.error('获取物品列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取物品列表失败'
    });
  }
});

module.exports = router;