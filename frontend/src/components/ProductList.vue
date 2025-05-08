<template>
  <div class="product-container">
    <!-- 搜索状态提示 -->
    <div v-if="activeSearch || activeCategory" class="filter-tips">
      <el-tag v-if="activeCategory" type="info" size="large">
        当前分类：{{ activeCategory }}
      </el-tag>
      <el-tag v-if="activeSearch" type="info" size="large">
        搜索关键词：{{ activeSearch }}
      </el-tag>
      <div class="result-count" v-if="filteredProducts.length > 0">
        共找到 {{ filteredProducts.length }} 条结果
      </div>
      <el-button 
        @click="clearFilter" 
        type="text" 
        size="small"
        class="clear-btn"
      >
        清除筛选
      </el-button>
    </div>
  
    <!-- 商品列表 -->
    <div v-if="filteredProducts.length > 0" class="product-grid">
      <el-row :gutter="20" justify="start" class="product-row">
        <el-col 
          v-for="product in filteredProducts" 
          :key="product.id" 
          :xs="24" 
          :sm="12" 
          :md="8"
          :lg="6"
          :xl="4"
          class="product-col"
        >
          <div class="product-col-wrapper">
            <ProductCard 
              :product="product" 
              :highlight="activeSearch"
              :show-actions="isMyProductsPage"
              @edit="handleEditProduct"
              @delete="handleDeleteProduct"
            />
          </div>
        </el-col>
      </el-row>
    </div>
  
    <!-- 空状态提示 -->
    <el-empty v-else description="暂无商品" />
    
    <!-- 商品发布表单 -->
    <ProductPublishForm ref="publishForm" @success="fetchProducts" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCategoryStore } from '@/stores/category'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import ProductPublishForm from '@/components/ProductPublishForm.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  activeCategory: {
    type: String,
    default: ''
  },
  isMyProductsPage: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const route = useRoute()
const categoryStore = useCategoryStore()
const productStore = useProductStore()
const publishForm = ref(null)

const products = ref([])
const isLoading = ref(true)

// 获取当前搜索关键词
const activeSearch = computed(() => {
  return route.query.search || ''
})

// 获取商品数据
const fetchProducts = async () => {
  try {
    isLoading.value = true
    if (props.isMyProductsPage) {
      await productStore.fetchMyProducts()
      products.value = productStore.myProducts
    } else {
      await productStore.fetchProducts()
      products.value = productStore.products
    }
  } catch (error) {
    console.error('获取商品失败:', error)
    ElMessage.error('获取商品失败')
  } finally {
    isLoading.value = false
  }
}

// 计算属性：筛选后的商品列表
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // 分类筛选
  if (props.activeCategory && props.activeCategory !== 'all') {
    result = result.filter(
      product => product.category.includes(props.activeCategory)
    )
  }
  
  // 关键词搜索
  if (activeSearch.value) {
    const keyword = activeSearch.value.toLowerCase()
    result = result.filter(product => 
      product.title.toLowerCase().includes(keyword) || 
      product.description.toLowerCase().includes(keyword)
    )
  }
  
  return result
})


// 编辑商品
const handleEditProduct = (product) => {
  router.push(`/product/edit/${product.id}`)
}

// 删除商品
const handleDeleteProduct = async (productId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await productStore.deleteProduct(productId)
    await fetchProducts()
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error(`删除失败: ${error.message}`)
    }
  }
}

// 清除筛选
const clearFilter = () => {
  categoryStore.clearFilter()
  router.push({ path: '/home' })
}

// 打开发布商品表单
const openPublishForm = () => {
  publishForm.value?.open()
}

// 暴露方法给父组件
defineExpose({
  openPublishForm
})

// 初始化时获取商品数据
onMounted(() => {
  fetchProducts()
})
</script>
  
<style scoped>
.product-container {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.filter-tips {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 10px;
}

.clear-btn {
  margin-left: 10px;
}

.product-grid {
  margin-top: 20px;
  width: 100%;
}

.product-row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -10px;
  margin-left: -10px;
}

.product-col {
  display: flex;
  flex-direction: column;
}

.product-col-wrapper {
  height: 100%;
  padding: 0 10px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.result-count {
  margin-left: 10px;
  color: var(--el-text-color-regular);
  font-size: 0.9em;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .product-container {
    padding: 10px;
  }
  
  .filter-tips {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .clear-btn {
    margin-left: 0;
    margin-top: 5px;
  }
  
  .product-row {
    margin-right: -5px;
    margin-left: -5px;
  }
  
  .product-col-wrapper {
    padding: 0 5px;
  }
}
</style>