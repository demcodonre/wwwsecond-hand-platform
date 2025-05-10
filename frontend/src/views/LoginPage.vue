<template>
    <div class="login-container">
      <el-card class="login-card">
        <h2 class="login-title">二手交易平台</h2>
        <el-form
          ref="loginForm"
          :model="form"
          :rules="rules"
          @keyup.enter="submitForm"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm"
              :loading="loading"
              style="width: 100%"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="login-footer">
          还没有账号？<el-link type="primary" @click="goRegister">立即注册</el-link>
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import axios from '@/utils/axios'
  import { useUserStore } from '@/stores/user'
  
  const router = useRouter()
  const loginForm = ref(null)
  const loading = ref(false)
  
  const form = ref({
    username: '',
    password: ''
  })
  
  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ]
  }
  
  const submitForm = async () => {
  try {
    await loginForm.value.validate()
    loading.value = true
    
    const response = await axios.post('/auth/login', form.value)
    localStorage.setItem('token', response.data.token)
    
    // 设置用户信息
    const userStore = useUserStore()
    await userStore.setUserInfo(response.data.user)
    
    ElMessage.success('登录成功')
    router.push('/profile') 
  } catch (err) {
    let errorMessage = '登录失败'
    if (err.response) {
      if (err.response.status === 400) {
        errorMessage = '用户名或密码错误'
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message
      }
    }
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}
  
  const goRegister = () => {
    if (localStorage.getItem('token')) {
    ElMessage.warning('您已登录，请先退出当前账号')
    router.push('/profile')
  } else {
    // 未登录状态，正常跳转到注册页
    router.push('/register')
  }
}
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f7fa;
  }
  
  .login-card {
    width: 400px;
    padding: 20px;
  }
  
  .login-title {
    text-align: center;
    margin-bottom: 30px;
    color: var(--el-color-primary);
  }
  
  .login-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
  
  @media (max-width: 480px) {
    .login-card {
      width: 90%;
    }
  }
  </style>