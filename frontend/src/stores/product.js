import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '@/utils/axios';

export const useProductStore = defineStore('product', () => {
  const products = ref([]);
  const myProducts = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const currentProduct = ref(null);
  
  // 获取物品列表
  const fetchProducts = async () => {
    try {
      isLoading.value = true;
      const response = await axios.get('/products');
      products.value = response.data.data || response.data;
    } catch (err) {
      error.value = err.message;
      console.error('获取物品列表失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // 获取当前用户物品
const fetchMyProducts = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('/products/my')
    // 确保数据中包含id字段
    myProducts.value = (response.data.data || response.data).map(product => ({
      ...product,
      id: product._id || product.id 
    }))
  } catch (err) {
    error.value = err.message
    console.error('获取我的物品失败:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}
  
  // 获取物品详情
  const getProductDetail = async (id) => {
    try {
      isLoading.value = true;
      const response = await axios.get(`/products/${id}`);
      currentProduct.value = response.data.data || response.data;
      return currentProduct.value;
    } catch (err) {
      error.value = err.message;
      console.error('获取物品详情失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 获取单个物品详情
const fetchProductById = async (id) => {
  try {
    isLoading.value = true;
    const response = await axios.get(`/products/${id}`);
    currentProduct.value = response.data;
    return response.data;
  } catch (err) {
    error.value = err.message;
    console.error('获取物品详情失败:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
};
  
  // 创建物品
  const createProduct = async (postData) => {
    try {
      isLoading.value = true;
      const response = await axios.post('/products', postData);
      await fetchMyProducts(); 
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error('创建物品失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // 更新物品
  const updateProduct = async (id, updates) => {
    try {
      isLoading.value = true;
      const response = await axios.put(`/products/${id}`, updates);
      
      // 更新本地物品列表
      const index = myProducts.value.findIndex(p => p._id === id || p.id === id);
      if (index !== -1) {
        myProducts.value[index] = { ...myProducts.value[index], ...updates };
      }
      
      // 如果当前查看的就是这个物品，也更新currentProduct
      if (currentProduct.value && (currentProduct.value._id === id || currentProduct.value.id === id)) {
        currentProduct.value = { ...currentProduct.value, ...updates };
      }
      
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error('更新物品失败:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  

  // 删除物品
const deleteProduct = async (id) => {
  try {
    isLoading.value = true
    await axios.delete(`/products/${id}`)
    
    // 从本地列表中移除
    myProducts.value = myProducts.value.filter(p => p._id !== id && p.id !== id)
    
    // 如果当前查看的就是这个物品，清空currentProduct
    if (currentProduct.value && (currentProduct.value._id === id || currentProduct.value.id === id)) {
      currentProduct.value = null
    }
  } catch (err) {
    error.value = err.message
    console.error('删除物品失败:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}
  
  // 重置状态
  const reset = () => {
    products.value = [];
    myProducts.value = [];
    currentProduct.value = null;
    isLoading.value = false;
    error.value = null;
  };

  // 获取物品分类选项
const getCategories = () => {
  return [
    { value: '物品/电子外设', label: '电子外设' },
    { value: '物品/教材', label: '教材' },
    { value: '物品/运动器材', label: '运动器材' },
    { value: '物品/宿舍用品', label: '宿舍用品' },
    { value: '信息/家教', label: '家教' },
    { value: '信息/兼职', label: '兼职' },
    { value: '信息/租房', label: '租房' },
    { value: '代替/代课', label: '代课' },
    { value: '代替/代抄', label: '代抄' },
    { value: '代替/代写', label: '代写' },
    { value: '代替/刷课', label: '刷课' },
    { value: '代替/快递代取', label: '快递代取' },
    { value: '失物/校园卡', label: '校园卡' },
    { value: '失物/其他', label: '其他' },
    { value: '宝藏/电子教材', label: '电子教材' },
    { value: '宝藏/考试资料', label: '考试资料' },
  ]
}
  
  return {
    products,
    myProducts,
    isLoading,
    error,
    currentProduct,
    fetchProducts,
    fetchMyProducts,
    getProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    reset,
    fetchProductById,
    getCategories
  };
});
