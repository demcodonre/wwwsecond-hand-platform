<template>
    <div class="home-banner">
      <div class="banner-content">
        <h1 class="slogan">{{slogan}}</h1>
        <div class="search-container">
          <el-select 
            v-model="selectedCategory" 
            class="category-select"
            placeholder="选择分类"
            :popper-append-to-body="false"
          >
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="search-input-container">
            <el-input
              v-model="searchQuery"
              placeholder="搜索..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <el-button 
              type="primary" 
              class="search-button"
              @click="handleSearch"
            >
              <el-icon><Search /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { useCategoryStore } from '@/stores/category'
import { debounce } from 'lodash-es'

const props = defineProps({
  slogan: {
    type: String,
    default: '今天遇到松鼠了吗'
  }
})

const router = useRouter()
const route = useRoute()
// const categoryStore = useCategoryStore()
const searchQuery = ref('')
const selectedCategory = ref('')

// 从路由初始化搜索参数
if (route.query.search) {
  searchQuery.value = route.query.search
}
if (route.query.category) {
  selectedCategory.value = route.query.category
}

const categories = [
  { value: 'all', label: '全部' },
  { value: 'goods', label: '物品' },
  { value: 'information', label: '信息' },
  { value: 'service', label: '服务' },
  { value: 'other', label: '其他' }
]

// 防抖搜索
const debouncedSearch = debounce(() => {
  handleSearch()
}, 300)

// 监听搜索词变化
watch(searchQuery, () => {
  debouncedSearch()
})

const handleSearch = () => {
  const query = {}
  
  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim()
  }
  
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    query.category = selectedCategory.value
  }
  
  router.push({
    path: '/home',
    query: query
  })
}
  </script>
  
  <style scoped>
  .home-banner {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 80px 20px;
    text-align: center;
    margin-bottom: 40px;
  }
  
  .banner-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .slogan {
    font-size: 2.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 40px;
    line-height: 1.3;
  }
  
  .search-container {
    display: flex;
    justify-content: center;
    gap: 10px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .category-select {
    flex: 0 0 180px;
  }
  
  .search-input-container {
    display: flex;
    flex: 1;
  }
  
  .search-input {
    flex: 1;
  }
  
  .search-button {
    margin-left: 10px;
  }
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    .home-banner {
      padding: 50px 15px;
    }
    
    .slogan {
      font-size: 1.8rem;
      margin-bottom: 30px;
    }
    
    .search-container {
      flex-direction: column;
    }
    
    .category-select {
      flex: 1;
      width: 100%;
    }
    
    .search-button {
      margin-left: 0;
      margin-top: 10px;
    }
  }
  </style>