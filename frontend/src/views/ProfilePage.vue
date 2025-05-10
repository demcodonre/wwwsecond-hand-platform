<template>
  <div class="profile-page">
    <el-container>
      <!-- 侧边栏导航 -->
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="profile-menu"
          @select="handleMenuSelect"
        >
          <!-- 用户信息区域 -->
          <div class="user-info">
            <el-avatar :size="60" :src="getFullAvatarUrl(userStore.userInfo.avatar)" />
            <div class="username">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</div>
            <div class="join-date">注册于 {{ formatDate(userStore.userInfo.createdAt) }}</div>
          </div>

          <!-- 菜单项 -->
          <el-menu-item index="profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="publish" @click="handlePublish">
            <el-icon><Edit /></el-icon>
            <span>我要发布</span>
          </el-menu-item>
          <el-menu-item index="my-products">
            <el-icon><Goods /></el-icon>
            <span>我的物品</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>账号设置</span>
          </el-menu-item>
          <el-menu-item index="logout" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main>
        <!-- 个人资料 -->
        <div v-if="activeMenu === 'profile'" class="profile-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>个人资料</span>
                <el-button type="primary" @click="editMode = true" v-if="!editMode">编辑资料</el-button>
              </div>
            </template>

            <el-form
              v-if="editMode"
              :model="userForm"
              label-width="80px"
              ref="userFormRef"
            >
              <el-form-item label="头像">
                <el-upload
                  class="avatar-uploader"
                  :action="avatarUploadUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  name="avatar"
                >
                  <img v-if="userForm.avatar" :src="getFullAvatarUrl(userForm.avatar)" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="userForm.nickname" />
              </el-form-item>
              <el-form-item label="QQ" prop="qq">
                <el-input v-model="userForm.qq" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userForm.email" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitUserForm">保存</el-button>
                <el-button @click="cancelEdit">取消</el-button>
              </el-form-item>
            </el-form>

            <div v-else class="profile-view">
              <div class="profile-field">
                <span class="label">用户名：</span>
                <span class="value">{{ userStore.userInfo.username }}</span>
              </div>
              <div class="profile-field">
                <span class="label">昵称：</span>
                <span class="value">{{ userStore.userInfo.nickname || '未设置' }}</span>
              </div>
              <div class="profile-field">
                <span class="label">QQ：</span>
                <span class="value">{{ userStore.userInfo.qq || '未设置' }}</span>
              </div>
              <div class="profile-field">
                <span class="label">邮箱：</span>
                <span class="value">{{ userStore.userInfo.email || '未设置' }}</span>
              </div>
              <div class="profile-field">
                <span class="label">注册时间：</span>
                <span class="value">{{ formatDate(userStore.userInfo.createdAt) }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 我的物品 -->
        <div v-if="activeMenu === 'my-products'" class="my-products-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>我的物品</span>
                <el-button type="primary" @click="handlePublish">发布物品</el-button>
              </div>
            </template>

            <ProductList 
  :is-my-products-page="true"
  :show-actions="true"
  @edit="handleEditProduct"
  @delete="handleDeleteProduct"
  ref="productListRef"
/>
          </el-card>
        </div>

        

        <!-- 账号设置 -->
        <div v-if="activeMenu === 'settings'" class="settings-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>账号设置</span>
              </div>
            </template>

            <el-tabs type="border-card">
              <el-tab-pane label="修改密码">
                <el-form
                  :model="passwordForm"
                  :rules="passwordRules"
                  ref="passwordFormRef"
                  label-width="120px"
                >
                  <el-form-item label="当前密码" prop="oldPassword">
                    <el-input
                      v-model="passwordForm.oldPassword"
                      type="password"
                      show-password
                    />
                  </el-form-item>
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input
                      v-model="passwordForm.newPassword"
                      type="password"
                      show-password
                    />
                  </el-form-item>
                  <el-form-item label="确认新密码" prop="confirmPassword">
                    <el-input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      show-password
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="submitPasswordForm">确认修改</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </el-main>
    </el-container>

    <!-- 物品发布表单 -->
    <ProductPublishForm ref="publishForm" @success="handleProductSuccess" />

    <!-- 物品编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form
        :model="editForm"
        :rules="productRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" rows="4" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="editForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="editForm.category" placeholder="请选择分类">
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="editForm.contact" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status">
            <el-option label="在售" value="available" />
            <el-option label="已售出" value="sold" />
            <el-option label="已下架" value="removed" />
          </el-select>
        </el-form-item>
        <el-form-item label="物品图片">
          <el-upload
            action="/api/upload"
            list-type="picture-card"
            :file-list="fileList"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemoveImage"
            :headers="uploadHeaders"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import ProductList from '@/components/ProductList.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProductPublishForm from '@/components/ProductPublishForm.vue'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()

// 环境变量
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL

// 计算属性
const avatarUploadUrl = computed(() => `${apiBaseUrl}/user/avatar`)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

// 当前激活的菜单
const activeMenu = ref('profile')

// 编辑模式
const editMode = ref(false)

// 用户表单
const userForm = ref({
  avatar: '',
  nickname: '',
  qq: '',
  email: ''
})

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 修改
const passwordFormRef = ref(null);

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 物品编辑相关
const productListRef = ref(null)
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = ref({
  id: '',
  title: '',
  description: '',
  price: 0,
  category: '',
  contact: '',
  status: 'available',
  images: []
})

const fileList = ref([])


const categories = computed(() => productStore.getCategories())

// 物品表单验证规则
const productRules = {
  title: [
    { required: true, message: '标题', trigger: 'blur' },
    { max: 50, message: '标题不能超过50个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '描述', trigger: 'blur' },
    { max: 500, message: '描述不能超过500个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  contact: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ]
}

// 发布表单引用
const publishForm = ref(null)

// 初始化数据
onMounted(async () => {
  try {
    await userStore.fetchUserInfo()
    initUserForm()
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
})

// 初始化用户表单
const initUserForm = () => {
  userForm.value = {
    avatar: userStore.userInfo.avatar,
    nickname: userStore.userInfo.nickname,
    qq: userStore.userInfo.qq,
    email: userStore.userInfo.email
  }
}

// 菜单选择处理
const handleMenuSelect = (index) => {
  if (index === 'logout') return
  activeMenu.value = index
}

// 处理发布物品
const handlePublish = () => {
  publishForm.value?.open()
}

// 物品发布成功回调
const handleProductSuccess = () => {
  if (activeMenu.value === 'my-products') {
    productListRef.value?.fetchProducts()
  }
}

// 处理编辑物品
const handleEditProduct = async (product) => {
  try {
    // 获取物品详情
    const response = await productStore.fetchProductDetail(product.id)
    const productDetail = response.data
    
    // 填充表单
    editForm.value = {
      id: productDetail._id,
      title: productDetail.title,
      description: productDetail.description,
      price: productDetail.price,
      category: productDetail.category,
      contact: productDetail.contact,
      status: productDetail.status,
      images: productDetail.images
    }
    
    // 转换图片为上传组件需要的格式
    fileList.value = productDetail.images.map(img => ({
      url: getFullImageUrl(img),
      name: img.split('/').pop(),
      response: { url: img }
    }))
    
    editDialogVisible.value = true
  } catch (error) {
    console.error('获取物品详情失败:', error)
    ElMessage.error('获取物品详情失败')
  }
}

// 处理删除物品
const handleDeleteProduct = async (productId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await productStore.deleteProduct(productId)
    ElMessage.success('删除成功')
    
    // 刷新物品列表
    productListRef.value?.fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交编辑表单
const submitEditForm = async () => {
  try {
    await editFormRef.value.validate()
    
    const updates = {
      title: editForm.value.title,
      description: editForm.value.description,
      price: editForm.value.price,
      category: editForm.value.category,
      contact: editForm.value.contact,
      status: editForm.value.status,
      images: editForm.value.images
    }
    
    await productStore.updateProduct(editForm.value.id, updates)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    
    // 刷新物品列表
    productListRef.value?.fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新失败:', error)
      ElMessage.error(error.message || '更新失败')
    }
  }
}


// 图片上传成功处理
const handleUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    editForm.value.images = fileList.map(file => {
      return file.response?.url || file.url.replace(fileBaseUrl + '/uploads/', '')
    })
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

// 删除图片处理
const handleRemoveImage = (file, fileList) => {
  editForm.value.images = fileList.map(f => {
    return f.response?.url || f.url.replace(fileBaseUrl + '/uploads/', '')
  })
}

// 获取完整头像URL
const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return ''
  if (avatarPath.startsWith('http')) return avatarPath
  return `${fileBaseUrl}${avatarPath.startsWith('/uploads') ? '' : '/uploads'}${avatarPath}`
}

// 获取完整图片URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return `${fileBaseUrl}${imagePath.startsWith('/uploads') ? '' : '/uploads'}${imagePath}`
}

// 上传前校验
const beforeAvatarUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJpgOrPng) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
  }

  return isJpgOrPng && isLt2M
}

// 上传成功处理
const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    userForm.value.avatar = response.data.avatarUrl
    userStore.userInfo.avatar = response.data.avatarUrl
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

// 提交用户表单
const submitUserForm = async () => {
  try {
    await userStore.updateUserInfo(userForm.value)
    ElMessage.success('资料更新成功')
    editMode.value = false
  } catch (error) {
    ElMessage.error(error.message || '更新失败')
  }
}

// 取消编辑
const cancelEdit = () => {
  editMode.value = false
  initUserForm()
}

// 提交密码表单
const submitPasswordForm = async () => {
  try {
    // 先验证表单
    await passwordFormRef.value.validate();
    
    // 调用store中的密码修改方法
    await userStore.changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    });
    
    // 清空表单
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
  } catch (error) {
    console.error('密码修改出错:', error);
  }
};

// 退出登录
const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出失败:', error)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.el-container {
  max-width: 1200px;
  margin: 0 auto;
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}

.profile-menu {
  border-right: none;
}

.user-info {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #e6e6e6;
}

.username {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.join-date {
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.el-main {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-view {
  padding: 10px;
}

.profile-field {
  margin-bottom: 15px;
  font-size: 14px;
}

.profile-field .label {
  display: inline-block;
  width: 80px;
  color: #666;
}

.profile-field .value {
  color: #333;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
}

.my-products-content {
  padding: 20px;
}

.settings-content {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}
</style>

