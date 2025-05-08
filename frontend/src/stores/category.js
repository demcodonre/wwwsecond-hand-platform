import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export const useCategoryStore = defineStore('category', () => {
  const route = useRoute()
  const router = useRouter()
  
  // 当前选中分类（格式："主分类/子分类"）
  const currentCategory = ref('')
  
  // 从URL参数初始化分类
  function initFromRoute() {
    if (route.query.category) {
      currentCategory.value = decodeURIComponent(route.query.category)
    }
  }
  
  // 更新分类筛选
  function setCategory(categoryPath) {
    currentCategory.value = categoryPath
    // 如果当前不是首页，则跳转到首页并带参数
    if (route.path !== '/') {
      router.push({
        path: '/',
        query: { category: encodeURIComponent(categoryPath) }
      })
    } else {
      // 已经在首页，只更新query
      router.replace({
        query: { category: encodeURIComponent(categoryPath) }
      })
    }
  }
  
  // 清除筛选
  function clearFilter() {
    currentCategory.value = ''
    router.push({ path: '/' })
  }

  return {
    currentCategory,
    initFromRoute,
    setCategory,
    clearFilter
  }
})