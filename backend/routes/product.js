const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');

// 创建物品
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price, category, contact, images } = req.body;

    // 验证必要字段（确保images是数组）
    if (!title || !description || !price || !category || !contact || !images) {
      return res.status(400).json({ code: 400, message: '缺少必要字段' });
    }

    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      contact,
      images: Array.isArray(images) ? images : [images], 
      owner: req.user.id
    });

    await product.save();
    res.status(201).json({ code: 201, message: '物品发布成功', data: product });
  } catch (error) {
    console.error('物品创建错误:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取所有物品
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('owner', 'username avatar')
    
    res.json({
      code: 200,
      data: products
    })
  } catch (error) {
    console.error('获取物品列表失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取物品列表失败'
    })
  }
});


// 获取当前用户物品 
router.get('/my', auth, async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .populate('owner', 'username avatar')
      .lean();

    const result = products.map(product => ({
      ...product,
      images: product.images.map(img => 
        img.startsWith('uploads/') ? `/${img}` : `${img}`
      ),
      createdAt: product.createdAt.toISOString()
    }));

    res.json({ code: 200, data: result, count: result.length });
  } catch (error) {
    console.error('获取用户物品失败:', error);
    res.status(500).json({ 
      code: 500,
      message: '获取物品失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// 获取单个物品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('owner', 'username avatar')
      .lean();

    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '物品未找到'
      });
    }

    // 转换图片路径为可访问的URL
    product.images = product.images.map(img => `/uploads/${img}`);
    
    res.json({
      code: 200,
      data: product
    });
  } catch (error) {
    console.error('获取物品详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取物品详情失败'
    });
  }
});


// 更新物品 
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'price', 'category', 'contact', 'status'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({
        code: 400,
        message: '无效的更新字段',
        allowedUpdates
      });
    }
    
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '物品未找到或无权操作'
      });
    }
    
    // 单独处理price确保是数字
    if (updates.includes('price')) {
      req.body.price = parseFloat(req.body.price);
      if (isNaN(req.body.price)) {
        return res.status(400).json({
          code: 400,
          message: '价格必须是有效数字'
        });
      }
    }

    updates.forEach(update => product[update] = req.body[update]);
    product.updatedAt = Date.now();
    await product.save();
    
    res.json({
      code: 200,
      message: '物品更新成功',
      data: {
        id: product._id,
        title: product.title,
        price: product.price,
        status: product.status
      }
    });
  } catch (error) {
    console.error('更新物品失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新物品失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// 删除物品 
router.delete('/:id', auth, async (req, res) => {
  try {
    let product;
    
    // 检查是否是管理员
    const user = await User.findById(req.user.id);
    const isAdmin = user && user.role === 'admin';
    
    if (isAdmin) {
      // 管理员可以删除任何物品
      product = await Product.findByIdAndDelete(req.params.id);
    } else {
      // 普通用户只能删除自己的物品
      product = await Product.findOneAndDelete({
        _id: req.params.id,
        owner: req.user.id
      });
    }
    
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '物品未找到或无权操作'
      });
    }
    
    // 从用户的物品列表中移除
    await User.findByIdAndUpdate(product.owner, {
      $pull: { products: product._id }
    });

    // 删除关联的图片文件
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(image => {
        const cleanImagePath = image.replace(/^uploads[\\/]/, '');
        const imagePath = path.join(__dirname, '../../uploads', cleanImagePath);
        
        return fs.promises.unlink(imagePath).catch(err => {
          if (err.code !== 'ENOENT') {
            console.error('删除图片失败:', imagePath, err);
          }
        });
      });
      await Promise.all(deletePromises);
    }
    
    res.json({
      code: 200,
      message: '物品删除成功',
      deletedId: product._id
    });
  } catch (error) {
    console.error('删除物品失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除物品失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;