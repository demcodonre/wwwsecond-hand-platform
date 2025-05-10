const { User } = require('../models');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const bcrypt = require('bcryptjs');

const validateUpdateFields = (data) => {
  const errors = {};
  
  if (data.nickname && (data.nickname.length < 2 || data.nickname.length > 12)) {
    errors.nickname = '昵称长度应在2-12个字符之间';
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = '请输入有效的邮箱地址';
  }
  
  if (data.qq && !/^\d{5,12}$/.test(data.qq)) {
    errors.qq = 'QQ号应为5-12位数字';
  }
  
  return Object.keys(errors).length === 0 ? null : errors;
};

// 更新用户信息方法
exports.updateProfile = async (req, res) => {
  try {
    const { nickname, qq, email } = req.body;
    
    // 验证字段
    const validationErrors = validateUpdateFields(req.body);
    if (validationErrors) {
      return res.status(400).json({ 
        code: 400, 
        message: '验证失败',
        errors: validationErrors
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { nickname, qq, email, updatedAt: Date.now() },
      { new: true, select: '-password -__v' }
    );
    
    res.json({ 
      code: 200, 
      message: '用户信息更新成功',
      data: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '更新用户信息失败' });
  }
};

// 获取用户信息
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    // 添加完整头像URL
    const userObj = user.toObject();
    if (userObj.avatar) {
      userObj.avatarUrl = `${process.env.FILE_BASE_URL}${userObj.avatar}`;
    }
    
    res.json({ 
      code: 200, 
      data: userObj 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '获取用户信息失败' });
  }
};


// 上传头像
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请上传头像文件' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    // 删除旧头像文件
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../uploads', user.avatar);
      try {
        await unlink(oldAvatarPath);
      } catch (err) {
        console.error('删除旧头像失败:', err);
      }
    }
    
    // 保存新头像
    const avatarPath = `/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();
    
    res.json({ 
      code: 200, 
      data: { 
        avatarUrl: `${process.env.FILE_BASE_URL}${avatarPath}`  
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '上传头像失败' });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    // 验证旧密码
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ code: 400, message: '当前密码不正确' });
    }
    
    // 更新密码
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ code: 200, message: '密码修改成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '密码修改失败' });
  }
};