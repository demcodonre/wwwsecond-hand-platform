import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/utils/axios'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { ElMessage } from 'element-plus';

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const userInfo = ref({
    id: '',
    avatar: '',
    username: '用户名',
    nickname: '昵称',
    qq: '',
    email: '',
    role: 'user', 
    createdAt: null
  })

  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // 登录后设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = { 
      ...userInfo.value,
      id: info._id || '',
      avatar: info.avatar || '',
      username: info.username || '用户名',
      nickname: info.nickname || '新用户',
      qq: info.qq || '',
      email: info.email || '',
      role: info.role || 'user', 
      createdAt: info.createdAt || null
    }
    isAuthenticated.value = true
  }
  
  // 添加 isAdmin 计算属性
  const isAdmin = computed(() => userInfo.value.role === 'admin')

  // 更新用户信息
  const updateUserInfo = async (newInfo) => {
    try {
      isLoading.value = true
      const response = await axios.put('/user/profile', newInfo)
      if (response.code === 200) {
        userInfo.value = { ...userInfo.value, ...newInfo }
        return true
      }
      return false
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error 
    } finally {
      isLoading.value = false
    }
  }

  // 获取当前用户信息
  const fetchUserInfo = async () => {
    try {
      isLoading.value = true
      const response = await axios.get('/user/profile')
      console.log('调试用户信息响应:', response.data)
      if (response.code === 200) {
        setUserInfo(response.data)
        return true
      }
      return false
    } catch (error) {
      console.error('获取用户信息失败:', error)
      if (error.response?.status === 401) {
        logout()
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 退出登录
  const logout = async (options = {}) => {
    const {
      silent = false,       // 是否静默退出（不显示消息）
      redirectToLogin = true // 是否跳转到登录页
    } = options

    try {
      // 调用后端退出接口
      await axios.post('/auth/logout')
    } catch (error) {
      if (!silent) {
        console.error('退出请求失败:', error)
      }
    } finally {
      // 清除前端状态
      localStorage.removeItem('token')
      userInfo.value = {
        id: '',
        avatar: '',
        username: '用户名',
        nickname: '昵称',
        qq: '',
        email: '',
        createdAt: null
      }
      isAuthenticated.value = false
      
      if (redirectToLogin) {
        router.push('/login')
      }
    }
  }

  // changePassword
const changePassword = async (passwordData) => {
  try {
    const response = await axios.patch('/user/password', {
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    });
    
    if (response.code === 200) {
      ElMessage.success(response.message || '密码修改成功');
      return true;
    }
    return false;
  } catch (error) {
    let errorMessage = '密码修改失败';
    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    ElMessage.error(errorMessage);
    throw error;
  }
};

  return { 
    userInfo, 
    isAuthenticated,
    isLoading,
    isAdmin,
    setUserInfo,
    updateUserInfo,
    fetchUserInfo,
    logout,
    changePassword
  }
})