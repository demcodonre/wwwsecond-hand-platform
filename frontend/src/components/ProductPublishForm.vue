<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      title="详细信息"
      width="70%"
      :before-close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="top"
        enctype="multipart/form-data"
      >
        <!-- 图片上传 -->
        <el-form-item label="图片" prop="images">
          <el-upload
            :file-list="fileList"
            :action="uploadConfig.action"
            :headers="uploadConfig.headers"
            list-type="picture-card"
            :limit="5"
            :on-exceed="handleExceed"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
            :on-preview="handlePictureCardPreview"
            :on-error="handleUploadError"
            multiple
            drag
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
            <div class="upload-tip">
              点击或拖拽上传图片<br/>
              (最多5张)
            </div>
          </el-upload>
        </el-form-item>

        <!-- 分类选择 -->
        <el-form-item label="分类" prop="category">
          <el-cascader
            v-model="form.category"
            :options="categoryOptions"
            :props="{ expandTrigger: 'hover', value: 'value', label: 'label' }"
            placeholder="请选择分类"
            clearable
          />
        </el-form-item>

        <!-- 标题 -->
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <!-- 价格 -->
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="请输入价格"
          />
          <span class="price-unit">元</span>
        </el-form-item>

        <!-- 描述 -->
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 联系方式 -->
        <el-form-item label="联系方式" prop="contact">
          <el-input
            v-model="form.contact"
            placeholder="请输入QQ/微信/手机号"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="isSubmitting">
            发布商品
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" width="60%">
      <div>
        <img w-full :src="previewImageUrl" alt="Preview" style="max-width: 100%;" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useProductStore } from '@/stores/product'

const emit = defineEmits(['success'])
const productStore = useProductStore()

// 表单引用
const formRef = ref(null)

// 对话框状态
const dialogVisible = ref(false)

// 预览相关状态
const previewVisible = ref(false)
const previewImageUrl = ref('')

// 提交状态
const isSubmitting = ref(false)

// 文件列表
const fileList = ref([])

// 上传配置
const uploadConfig = computed(() => ({
  action: `${import.meta.env.VITE_API_BASE_URL}/upload`,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}))

// 表单数据
const form = ref({
  images: [],
  category: '',
  title: '',
  price: null,
  description: '',
  contact: ''
})

// 表单验证规则
const rules = {
  images: [
    { required: true, message: '请上传图片', trigger: 'change' },
    { validator: (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error('至少上传一张图片'))
      } else {
        callback()
      }
    }, trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在3到50个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能为负数', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在10到500个字符', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系方式', trigger: 'blur' }
  ]
}

// 分类选项 - 应与导航栏现有分类一致
const categoryOptions = ref([
  {
    value: '物品',
    label: '物品',
    children: [
      { value: '电子外设', label: '电子外设' },
      { value: '教材', label: '教材' },
      { value: '运动器材', label: '运动器材' },
      { value: '宿舍用品', label: '宿舍用品' },
    ]
  },
  {
    value: '信息',
    label: '信息',
    children: [
      { value: '家教', label: '家教' },
      { value: '兼职', label: '兼职' },
      { value: '租房', label: '租房' }
    ]
  },
  {
    value: '代替',
    label: '代替',
    children: [
      { value: '代课', label: '代课' },
      { value: '代抄', label: '代抄' },
      { value: '代写', label: '代写' },
      { value: '快递代取', label: '快递代取' },
      { value: '刷课', label: '刷课' }
    ]
  },
  {
    value: '失物',
    label: '失物',
    children: [
      { value: '校园卡', label: '校园卡' },
      { value: '其他', label: '其他' }
    ]
  },
  {
    value: '宝藏',
    label: '宝藏',
    children: [
      { value: '电子教材', label: '电子教材' },
      { value: '考试资料', label: '考试资料' }
    ]
  }
])

// 图片上传处理
const handleUploadSuccess = (response, uploadFile) => {
  if (response.code === 200) {
    form.value.images.push(response.data.url)
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
    // 从fileList中移除失败的文件
    const index = fileList.value.findIndex(file => file.uid === uploadFile.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
    }
  }
}

const handleUploadError = (error) => {
  ElMessage.error(`图片上传失败: ${error.message}`)
}

const handleRemove = (file) => {
  const index = form.value.images.findIndex(url => url === file.url || url === file.response?.data?.url)
  if (index !== -1) {
    form.value.images.splice(index, 1)
  }
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传5张图片')
}

const handlePictureCardPreview = (file) => {
  previewImageUrl.value = file.url || file.response?.data?.url
  previewVisible.value = true
}

// 打开表单
const open = () => {
  dialogVisible.value = true
}

// 关闭表单
const handleClose = (done) => {
  if (isSubmitting.value) return
  
  formRef.value?.resetFields()
  form.value = {
    images: [],
    category: '',
    title: '',
    price: null,
    description: '',
    contact: ''
  }
  fileList.value = []
  done()
}

// 提交表单
const submitForm = async () => {
  try {
    isSubmitting.value = true
    // 验证表单（不含图片
    await formRef.value.validate()
    
    //构建纯JSON数据 
    const postData = {
      title: form.value.title,
      description: form.value.description,
      price: form.value.price,
      category: Array.isArray(form.value.category) 
        ? form.value.category.join('/') 
        : form.value.category,
      contact: form.value.contact,
      images: form.value.images // 使用已经上传的图片URL数组
    }
    // 调用Store方法提交JSON数据
    await productStore.createProduct(postData)
    
    ElMessage.success('发布成功')
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error(error.message || '发布失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 暴露open方法供父组件调用
defineExpose({
  open
})
</script>

<style scoped>
.upload-tip {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;
}

.price-unit {
  margin-left: 8px;
  color: var(--el-text-color-regular);
}

.el-input-number {
  width: 100%;
}

.el-cascader {
  width: 100%;
}
</style>