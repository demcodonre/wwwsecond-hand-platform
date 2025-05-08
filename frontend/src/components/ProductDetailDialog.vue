<template>
    <el-dialog
      v-model="dialogVisible"
      :title="product.title"
      width="80%"
      top="5vh"
      :fullscreen="isMobile"
      destroy-on-close
    >
      <!-- 图片轮播 -->
      <el-carousel 
        v-if="product.images && product.images.length > 0" 
        :interval="4000" 
        height="400px"
        indicator-position="outside"
        trigger="click"
      >
        <el-carousel-item v-for="(image, index) in product.images" :key="index">
          <img 
            :src="image.startsWith('http') ? image : `${fileBaseUrl}${image}`" 
            :alt="`${product.title}-${index}`"
            class="detail-image"
          />
        </el-carousel-item>
      </el-carousel>
      <div v-else class="no-image">
        <el-icon :size="50"><Picture /></el-icon>
        <span>暂无图片</span>
      </div>
  
      <!-- 商品信息 -->
      <div class="product-detail-content">
        <!-- 价格和分类 -->
        <div class="detail-meta">
          <div class="detail-price">¥{{ product.price.toLocaleString() }}</div>
          <el-tag type="info">{{ product.category }}</el-tag>
        </div>
        
        <!-- 商品描述 -->
        <div class="detail-description">
          <h3>商品描述</h3>
          <p>{{ product.description }}</p>
        </div>
        
        <!-- 发布时间 -->
        <div class="detail-date">
          发布于: {{ formatDate(product.createdAt) }}
        </div>
        
        <!-- 发布者信息 -->
        <div class="detail-owner">
          <h3>发布者信息</h3>
          <div class="owner-info">
            <el-avatar :size="50" :src="product.owner?.avatar" />
            <div class="owner-meta">
              <div class="owner-name">{{ product.owner?.username }}</div>
              <div class="owner-join">加入时间: {{ formatDate(product.owner?.createdAt) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 联系方式 -->
        <div class="detail-contact">
          <el-button 
            type="primary" 
            @click="showContact = !showContact"
            class="contact-button"
          >
            {{ showContact ? '隐藏联系方式' : '查看联系方式' }}
          </el-button>
          <div v-if="showContact" class="contact-info">
            {{ product.contact }}
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { Picture } from '@element-plus/icons-vue'
  import { useWindowSize } from '@vueuse/core'
  
  const props = defineProps({
    product: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        title: '',
        images: [],
        category: '',
        price: 0,
        description: '',
        contact: '',
        owner: {
          id: '',
          avatar: '',
          username: '',
          createdAt: ''
        },
        createdAt: ''
      })
    }
  })
  
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value < 768)
  const dialogVisible = ref(false)
  const showContact = ref(false)
  const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString()
  }
  
  const open = () => {
    dialogVisible.value = true
    showContact.value = false
  }
  
  defineExpose({
    open
  })
  </script>
  
  <style scoped>
  .detail-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .no-image {
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-light);
  }
  
  .no-image span {
    margin-top: 8px;
    font-size: 14px;
  }
  
  .product-detail-content {
    padding: 20px;
  }
  
  .detail-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .detail-price {
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--el-color-danger);
  }
  
  .detail-description {
    margin: 20px 0;
    padding: 15px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
  }
  
  .detail-description h3 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .detail-date {
    color: var(--el-text-color-secondary);
    font-size: 0.9em;
    text-align: right;
    margin-bottom: 20px;
  }
  
  .detail-owner {
    margin: 20px 0;
    padding: 15px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
  }
  
  .detail-owner h3 {
    margin-top: 0;
    margin-bottom: 15px;
  }
  
  .owner-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .owner-meta {
    display: flex;
    flex-direction: column;
  }
  
  .owner-name {
    font-weight: bold;
  }
  
  .owner-join {
    font-size: 0.8em;
    color: var(--el-text-color-secondary);
  }
  
  .detail-contact {
    text-align: center;
    margin-top: 30px;
  }
  
  .contact-button {
    width: 100%;
    max-width: 300px;
  }
  
  .contact-info {
    margin-top: 15px;
    padding: 15px;
    background-color: var(--el-color-primary-light-9);
    border-radius: 4px;
    font-size: 1.1em;
  }
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    .product-detail-content {
      padding: 10px;
    }
    
    .detail-price {
      font-size: 1.5rem;
    }
  }
  </style>