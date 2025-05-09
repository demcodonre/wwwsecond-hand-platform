const { Post } = require('../models');

// 获取用户发布的帖子
exports.getUserPosts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { creator: req.user.id };
    if (status) query.status = status;
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('creator', 'username avatar');
      
    const total = await Post.countDocuments(query);
    
    res.json({ 
      code: 200, 
      data: { 
        total, 
        posts 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '获取帖子列表失败' });
  }
};

// 创建帖子
exports.createPost = async (req, res) => {
  try {
    const { title, content, price, category } = req.body;
    const images = req.files ? req.files.map(file => `/posts/${file.filename}`) : [];
    
    const post = new Post({
      title,
      content,
      price,
      category,
      images,
      creator: req.user.id
    });
    
    await post.save();
    
    res.json({ 
      code: 200, 
      data: { 
        id: post._id,
        message: '帖子创建成功' 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '创建帖子失败' });
  }
};

// 更新帖子
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content, price, category, status } = req.body;
    
    const post = await Post.findOneAndUpdate(
      { _id: postId, creator: req.user.id },
      { title, content, price, category, status },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在或无权操作' });
    }
    
    res.json({ 
      code: 200, 
      message: '帖子更新成功' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '更新帖子失败' });
  }
};

// 删除帖子
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    
    const post = await Post.findOneAndDelete({
      _id: postId,
      creator: req.user.id
    });
    
    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在或无权操作' });
    }
    
    // 删除关联的图片文件
    if (post.images && post.images.length > 0) {
      const deletePromises = post.images.map(image => {
        const imagePath = path.join(__dirname, '../uploads', image);
        return unlink(imagePath).catch(err => console.error('删除图片失败:', err));
      });
      await Promise.all(deletePromises);
    }
    
    res.json({ 
      code: 200, 
      message: '帖子删除成功' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '删除帖子失败' });
  }
};