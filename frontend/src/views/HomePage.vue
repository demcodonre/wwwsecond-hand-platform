<template>
  <div class="home-page">
    <HomeBanner slogan="今天 遇见松鼠了么QwQ" />
    <ProductList :active-category="categoryStore.currentCategory" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue' 
import { useCategoryStore } from '@/stores/category'
import ProductList from '@/components/ProductList.vue'
import HomeBanner from '@/components/HomeBanner.vue'

const categoryStore = useCategoryStore()

onMounted(() => {
  categoryStore.initFromRoute() // 从URL参数初始化分类
})
</script>

<style>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>