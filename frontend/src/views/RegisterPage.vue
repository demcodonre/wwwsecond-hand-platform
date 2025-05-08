<template>
    <div class="register-container">
      <el-card class="register-card">
        <h2 class="register-title">用户注册</h2>
        <el-form
          ref="registerForm"
          :model="form"
          :rules="rules"
          label-width="80px"
          label-position="top"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码" 
              show-password 
            />
            <div class="password-strength">
              <span :class="{'active': passwordStrength > 0}">弱</span>
              <span :class="{'active': passwordStrength > 1}">中</span>
              <span :class="{'active': passwordStrength > 2}">强</span>
            </div>
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input 
              v-model="form.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码" 
              show-password 
            />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleRegister" 
              :loading="loading"
            >
              注册
            </el-button>
            <el-button @click="goToLogin">已有账号？去登录</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import axios from '@/utils/axios'
  import { useUserStore } from '@/stores/user'
  
  const router = useRouter()
  const registerForm = ref(null)
  const loading = ref(false)
  
  const form = ref({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  })
  
  // 密码强度计算
  const passwordStrength = computed(() => {
    const password = form.value.password
    if (!password) return 0
    
    let strength = 0
    if (password.length >= 6) strength++
    if (/[A-Z]/.test(password) || /[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    return Math.min(strength, 3)
  })
  
  // 表单验证规则
  const validatePassword = (rule, value, callback) => {
    if (value.length < 6) {
      callback(new Error('密码长度不能少于6位'))
    } else {
      callback()
    }
  }
  
  const validateConfirmPassword = (rule, value, callback) => {
    if (value !== form.value.password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }
  
  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 16, message: '长度在3到16个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { validator: validatePassword, trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      { validator: validateConfirmPassword, trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ]
  }
  
  // 注册处理
  const handleRegister = async () => {
  try {
    await registerForm.value.validate()
    loading.value = true
    
    const response = await axios.post('/auth/register', {
      username: form.value.username,
      password: form.value.password,
      email: form.value.email
    })
    
    if (response.code === 201) {
      ElMessage.success('注册成功')
      // 自动登录
      localStorage.setItem('token', response.data.token)
      // 设置用户信息
      const userStore = useUserStore()
      await userStore.setUserInfo(response.data.user)
      router.push('/profile')
    } else {
      ElMessage.error(response.message || '注册失败')
    }
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '注册失败')
    } else {
      ElMessage.error(error.message || '注册失败')
    }
  } finally {
    loading.value = false
  }
}
  
  // 跳转到登录页
  const goToLogin = () => {
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f7fa;
  }
  
  .register-card {
    width: 100%;
    max-width: 500px;
    padding: 20px;
  }
  
  .register-title {
    text-align: center;
    margin-bottom: 30px;
    color: #303133;
  }
  
  .password-strength {
    display: flex;
    margin-top: 8px;
  }
  
  .password-strength span {
    flex: 1;
    text-align: center;
    padding: 2px;
    color: #fff;
    background-color: #dcdfe6;
  }
  
  .password-strength span.active {
    background-color: #67c23a;
  }
  
  .password-strength span:nth-child(1).active {
    background-color: #f56c6c;
  }
  
  .password-strength span:nth-child(2).active {
    background-color: #e6a23c;
  }
  
  .password-strength span:nth-child(3).active {
    background-color: #67c23a;
  }
  </style>