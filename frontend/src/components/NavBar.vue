<template>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
      :collapse="isCollapse"
    >
      <!-- Logo区域 -->
      <div class="logo-container" @click="goHome">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <span class="logo-text">南岭松鼠市场</span>
      </div>
  
      <!-- 中间空白区域 -->
      <div class="flex-grow" />
  
      <!-- 分类菜单（桌面端显示） -->
      <template v-if="!isMobile">
        <el-sub-menu 
    v-for="category in categories" 
    :key="category.name"
    :index="category.name"
  >
    <template #title>{{ category.title }}</template>
    <el-menu-item 
      v-for="sub in category.subItems" 
      :key="sub.name"
      :index="sub.name"
      @click="handleCategoryClick(sub.fullPath)"
      :class="{ 'is-active': categoryStore.currentCategory === sub.fullPath }"
    >
      {{ sub.title }}
    </el-menu-item>
  </el-sub-menu>
      </template>
  
      <!-- 用户区域 -->
      <div v-if="userStore.isAuthenticated" class="user-area">
        <el-dropdown @command="handleUserCommand">
          <div class="user-info">
            <el-avatar :size="32" :src="getFullAvatarUrl(userStore.userInfo.avatar)" />
            <span class="user-name">{{ userStore.userInfo.nickname }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item v-if="userStore.isAdmin" command="admin">管理后台</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div v-else class="auth-buttons">
        <el-button type="text" @click="goToLogin">登录</el-button>
        <el-button type="primary" @click="goToRegister">注册</el-button>
      </div>
  
      <!-- 汉堡菜单（移动端显示） -->
      <div v-if="isMobile" class="mobile-menu">
        <el-dropdown @command="handleMobileCommand">
          <el-icon :size="24"><Menu /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <template v-for="category in categories" :key="category.name">
                <el-dropdown-item 
                  v-for="sub in category.subItems" 
                  :key="sub.name" 
                  :command="sub.name"
                >
                  {{ sub.title }}
                </el-dropdown-item>
                <el-dropdown-item divided />
              </template>
              <el-dropdown-item 
                v-if="!userStore.isAuthenticated" 
                command="login"
              >
                登录
              </el-dropdown-item>
              <el-dropdown-item 
                v-if="!userStore.isAuthenticated" 
                command="register"
              >
                注册
              </el-dropdown-item>
              <el-dropdown-item 
                v-if="userStore.isAuthenticated" 
                command="profile"
              >
                个人中心
              </el-dropdown-item>
              <el-dropdown-item 
                v-if="userStore.isAuthenticated" 
                command="logout"
                divided
              >
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-menu>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/user'
  import { Menu } from '@element-plus/icons-vue'
  import { useCategoryStore } from '@/stores/category'

  const router = useRouter()
  const userStore = useUserStore()
  const categoryStore = useCategoryStore()
  const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL
  // 分类数据
  const categories = ref([

  {
    name: 'goods',
    title: '物品',
    subItems: [
      { name: 'books', title: '教材', fullPath: '物品/教材' },
      { name: 'sports', title: '运动器材', fullPath: '物品/运动器材' },
      { name: 'electronics', title: '电子外设', fullPath: '物品/电子外设' },
      { name: 'daily', title: '宿舍用品', fullPath: '物品/宿舍用品' }
    ]
  },
    {
      name: 'info',
      title: '信息',
      subItems: [
        { name: 'tutor', title: '家教' , fullPath: '信息/家教'},
        { name: 'part-time', title: '兼职', fullPath: '信息/兼职' },
        { name: 'rent', title: '租房' , fullPath: '信息/租房'}
      ]
    },
    {
      name: 'substitute',
      title: '代替',
      subItems: [
        { name: 'class', title: '代课' , fullPath: '代替/代课'},
        { name: 'copy', title: '代抄' , fullPath: '代替/代抄'},
        { name: 'write', title: '代写' , fullPath: '代替/代写'},
        { name: 'express', title: '快递代取', fullPath: '代替/快递代取' },
        { name: 'course', title: '刷课', fullPath: '代替/刷课' }
      ]
    },
    {
      name: 'lost',
      title: '失物',
      subItems: [
        { name: 'lost-found', title: '校园卡', fullPath: '失物/校园卡' },
        { name: 'lost-report', title: '其他' , fullPath: '失物/其他'}
      ]
    },
    {
      name: 'treasure',
      title: '宝藏',
      subItems: [
        { name: 'free', title: '电子教材', fullPath: '宝藏/电子教材' },
        { name: 'discount', title: '考试资料', fullPath: '宝藏/考试资料' }
      ]
    }
  ])
  
  // 当前激活菜单
  const activeIndex = ref('')

  // 获取完整头像URL
const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return ''
  if (avatarPath.startsWith('http')) return avatarPath
  return `${fileBaseUrl}${avatarPath.startsWith('/uploads') ? '' : '/uploads'}${avatarPath}`
}
  
  // 响应式处理
  const isMobile = ref(false)
  const isCollapse = ref(false)
  
  const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 768
    isCollapse.value = isMobile.value
  }
  
  onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkScreenSize)
  })
  

  const handleCategoryClick = (fullPath) => {
  categoryStore.setCategory(fullPath)
  router.push('/') // 确保跳转到首页
}

  // 处理方法
  const handleSelect = (index) => {
    // 这里可以根据index跳转到对应路由
    console.log('Selected:', index)
  }
  
  const handleUserCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'admin') {
    router.push('/admin')
  } else if (command === 'logout') {
    userStore.logout()
  }
}

  // 移动端分类点击处理
  const handleMobileCommand = (command) => {
  if (command === 'login') {
    goToLogin()
  } else if (command === 'register') {
    goToRegister()
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
  } else {
    // 处理分类点击
    const category = findCategoryByCommand(command)
    if (category) {
      handleCategoryClick(category.fullPath)
    }
  }
}
// 辅助函数：根据command找到完整分类路径
function findCategoryByCommand(command) {
  for (const category of categories.value) {
    const subItem = category.subItems.find(sub => sub.name === command)
    if (subItem) return subItem
  }
  return null
}
  
  const goHome = () => {
    router.push('/')
  }
  
  const goToLogin = () => {
    router.push('/login')
  }
  
  const goToRegister = () => {
    router.push('/register')
  }
  </script>
  
  <style scoped>
  .el-menu-demo {
    display: flex;
    align-items: center;
    padding: 0 20px;
    border-bottom: solid 1px var(--el-menu-border-color);
  }
  
  .logo-container {
    display: flex;
    align-items: center;
    margin-right: 20px;
    cursor: pointer;
  }
  
  .logo {
    height: 40px;
    margin-right: 10px;
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: bold;
    color: var(--el-color-primary);
  }
  
  .flex-grow {
    flex-grow: 1;
  }
  
  .user-area {
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .user-name {
    margin-left: 8px;
    font-size: 14px;
  }
  
  .auth-buttons {
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
  
  .mobile-menu {
    margin-left: 20px;
  }

  .el-menu-item.is-active {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .logo-text {
      display: none;
    }
    
    .el-sub-menu {
      display: none;
    }
  }
  
  @media (min-width: 769px) {
    .mobile-menu {
      display: none;
    }
  }
  </style>