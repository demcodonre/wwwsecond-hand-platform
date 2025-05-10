<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { Picture } from '@element-plus/icons-vue'
import ProductDetailDialog from './ProductDetailDialog.vue'

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
        username: ''
      },
      createdAt: ''
    })
  },
  highlight: {
    type: String,
    default: ''
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

const userStore = useUserStore()
const detailDialog = ref(null)

// 获取基础URL
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL

// 获取完整头像URL
const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return ''
  if (avatarPath.startsWith('http')) return avatarPath
  return `${fileBaseUrl}${avatarPath.startsWith('/uploads') ? '' : '/uploads'}${avatarPath}`
}

// 高亮关键词
const highlightedTitle = computed(() => {
  if (!props.highlight) return props.product.title
  
  const regex = new RegExp(`(${props.highlight})`, 'gi')
  return props.product.title.replace(regex, '<span class="highlight">$1</span>')
})

const highlightedDescription = computed(() => {
  if (!props.highlight) return props.product.description
  
  const regex = new RegExp(`(${props.highlight})`, 'gi')
  return props.product.description.replace(regex, '<span class="highlight">$1</span>')
})

// 格式化价格
const formattedPrice = computed(() => {
  return '¥' + props.product.price.toLocaleString()
})

// 格式化日期
const formattedDate = computed(() => {
  if (!props.product.createdAt) return ''
  const date = new Date(props.product.createdAt)
  return date.toLocaleDateString()
})

// 显示物品详情弹窗
const showDetail = () => {
  detailDialog.value?.open()
}

// // 跳转到物品编辑页
// const handleEdit = (e) => {
//   e.stopPropagation()
//   router.push(`/product/edit/${props.product.id}`)
// }

const handleDelete = (e) => {
  e.stopPropagation()
  const productId = props.product._id || props.product.id
  if (!productId) {
    console.error('无法获取物品ID', props.product)
    return
  }
  emit('delete', productId)
}

// 是否是当前用户的物品
const isOwner = computed(() => {
  if (!userStore.isAuthenticated || !userStore.userInfo?.id || !props.product.owner) {
    return false
  }
  
  const ownerId = typeof props.product.owner === 'object' 
    ? props.product.owner.id || props.product.owner._id 
    : props.product.owner
    
  return ownerId === userStore.userInfo.id || userStore.isAdmin
})

const emit = defineEmits(['edit', 'delete'])

</script>

<template>
  <div>
  <el-card class="product-card" @click="showDetail">
    <!-- 物品图片轮播 -->
    <el-carousel 
      v-if="product.images && product.images.length > 0" 
      :interval="4000" 
      height="200px"
      indicator-position="outside"
    >
      <el-carousel-item v-for="(image, index) in product.images" :key="index">
        <img 
          :src="image.startsWith('http') ? image : `${fileBaseUrl}${image}`" 
          :alt="`${product.title}-${index}`"
          class="product-image"
        />
      </el-carousel-item>
    </el-carousel>
    <div v-else class="no-image">
      <el-icon :size="50"><Picture /></el-icon>
      <span>暂无图片</span>
    </div>

    <!-- 物品信息 -->
    <template #header>
      <div class="card-header">
        <div class="product-info">
          <span class="product-title" v-html="highlightedTitle"></span>
          <div class="product-meta">
            <el-tag type="info" size="small">{{ product.category }}</el-tag>
            <span class="product-date">{{ formattedDate }}</span>
          </div>
        </div>
      </div>
    </template>

    <div class="product-content">
      <div class="product-price">{{ formattedPrice }}</div>
      <div class="product-desc" v-html="highlightedDescription"></div>
      
      <!-- 卖家信息 -->
      <div class="product-owner">
    <el-avatar 
      :size="24" 
      :src="getFullAvatarUrl(product.owner?.avatar)" 
    />
    <span class="owner-name">{{ product.owner?.username }}</span>
  </div>
    </div>

    <!-- 操作按钮  -->
    <template v-if="showActions && isOwner" #footer>
  <div class="product-actions">
    <!-- <el-button size="small" @click.stop="handleEdit">编辑</el-button> -->
    <el-button size="small" type="danger" @click.stop="handleDelete">
      删除
    </el-button>
  </div>
</template>

    <!-- 物品详情弹窗 -->
    <ProductDetailDialog ref="detailDialog" :product="product" />
  </el-card>
  <ProductDetailDialog ref="detailDialog" :product="product" />
  </div>
</template>

<style scoped>
.product-card {
  margin-bottom: 20px;
  height: 100%;
  cursor: pointer;
  transition: transform 0.2s;
  min-width: 250px; 
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.product-info {
  flex: 1;
}

.product-title {
  font-weight: bold;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.product-content {
  padding: 0 10px 10px;
}

.product-price {
  color: var(--el-color-danger);
  font-size: 1.2em;
  font-weight: bold;
  margin: 8px 0;
}

.product-desc {
  color: var(--el-text-color-secondary);
  font-size: 0.9em;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 12px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 200px;
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

.product-owner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
}

.owner-name {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.product-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.highlight {
  background-color: #fffb8f;
  padding: 0 2px;
  border-radius: 2px;
}
</style>