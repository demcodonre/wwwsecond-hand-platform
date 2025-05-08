<template>
    <div class="admin-page">
      <h2>管理员面板</h2>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="商品管理" name="products">
          <el-table :data="products" style="width: 100%">
            <el-table-column prop="title" label="商品名称" />
            <el-table-column prop="owner.username" label="发布者" />
            <el-table-column prop="price" label="价格">
              <template #default="{row}">
                ¥{{ row.price.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="发布时间">
              <template #default="{row}">
                {{ new Date(row.createdAt).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{row}">
                <el-button size="small" @click="viewProduct(row._id)">查看</el-button>
                <el-button size="small" type="danger" @click="deleteProduct(row._id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import axios from '@/utils/axios'
  
  const router = useRouter()
  const activeTab = ref('products')
  const products = ref([])
  
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/admin/products')
      products.value = response.data.data || response.data
    } catch (error) {
      console.error('获取商品列表失败:', error)
      ElMessage.error('获取商品列表失败')
    }
  }
  
  const viewProduct = (id) => {
    router.push(`/product/${id}`)
  }
  
  const deleteProduct = async (id) => {
    try {
      await ElMessageBox.confirm('确定要删除这个商品吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await axios.delete(`/products/${id}`)
      await fetchProducts()
      ElMessage.success('删除成功')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除商品失败:', error)
        ElMessage.error(`删除失败: ${error.message}`)
      }
    }
  }
  
  onMounted(() => {
    fetchProducts()
  })
  </script>
  
  <style scoped>
  .admin-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h2 {
    margin-bottom: 20px;
  }
  </style>