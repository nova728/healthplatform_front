// ArticleEditor.vue
<template>
  <div class="article-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-header">
      <div class="left-tools">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button v-if="articleId" type="text" class="preview-link" @click="previewArticle">
          <Eye class="icon" />
          预览文章
        </el-button>
      </div>
      <div class="center-tools">
        <span class="save-status" :class="{ 'saving': isSaving }">
          {{ saveStatus }}
        </span>
      </div>
      <div class="right-tools">
        <el-button @click="saveDraft" :loading="isSaving">
          <Save class="icon" />
          保存草稿
        </el-button>
        <el-button type="primary" @click="showPublishDialog">
          <Send class="icon" />
          发布文章
        </el-button>
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="editor-main">
      <!-- 标题输入 -->
      <el-input
          v-model="articleForm.title"
          placeholder="请输入标题（最多100个字）"
          class="title-input"
          maxlength="100"
          show-word-limit
      />

      <!-- 内容编辑器 -->
      <div class="editor-wrapper">
        <!-- 工具栏 -->
        <div class="editor-toolbar">
          <el-button-group>
            <el-button @click="handleFormat('bold')" :class="{ active: isFormatActive('bold') }">
              <el-icon><Bold /></el-icon>
            </el-button>
            <el-button @click="handleFormat('italic')" :class="{ active: isFormatActive('italic') }">
              <el-icon><Italic /></el-icon>
            </el-button>
            <el-button @click="handleFormat('underline')" :class="{ active: isFormatActive('underline') }">
              <Underline class="icon" />
            </el-button>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-button-group>
            <el-button @click="insertHeading('h1')">H1</el-button>
            <el-button @click="insertHeading('h2')">H2</el-button>
            <el-button @click="insertHeading('h3')">H3</el-button>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-button @click="insertImage">
            <ImageIcon class="icon" />
            插入图片
          </el-button>

          <el-button @click="insertLink">
            <Link2 class="icon" />
            插入链接
          </el-button>

          <el-button @click="insertCode">
            <FileCode class="icon" />
            插入代码
          </el-button>

          <el-button @click="insertTable">
            <Table2 class="icon" />
            插入表格
          </el-button>
        </div>

        <!-- 编辑器主体 -->
        <div class="editor-content" ref="editorRef"></div>
      </div>
    </div>

    <!-- 右侧设置面板 -->
    <div class="editor-sidebar">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span>文章设置</span>
          </div>
        </template>

        <el-form :model="articleForm" label-width="80px">
          <el-form-item label="分类">
            <el-select v-model="articleForm.categoryId" placeholder="选择分类">
              <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="标签">
            <el-tag
                v-for="tag in articleForm.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
                class="tag-item"
            >
              {{ tag }}
            </el-tag>

            <el-input
                v-if="inputTagVisible"
                ref="tagInputRef"
                v-model="inputTag"
                class="tag-input"
                size="small"
                @keyup.enter="confirmTag"
                @blur="confirmTag"
            />

            <el-button v-else class="button-new-tag" size="small" @click="showTagInput">
              + 添加标签
            </el-button>
          </el-form-item>

          <el-form-item label="封面图">
            <el-upload
                class="cover-uploader"
                :show-file-list="false"
                :before-upload="beforeCoverUpload"
                :http-request="uploadCover"
            >
              <img v-if="articleForm.coverImage" :src="articleForm.coverImage" class="cover-image">
              <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 发布对话框 -->
    <el-dialog
        v-model="publishDialogVisible"
        title="发布文章"
        width="500px"
    >
      <el-form :model="publishForm" label-width="100px">
        <el-form-item label="发布时间">
          <el-radio-group v-model="publishForm.timeType">
            <el-radio label="now">立即发布</el-radio>
            <el-radio label="schedule">定时发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="publishForm.timeType === 'schedule'" label="预计发布时间">
          <el-date-picker
              v-model="publishForm.scheduleTime"
              type="datetime"
              placeholder="选择日期时间"
              :disabled-date="disabledDate"
          />
        </el-form-item>

        <el-form-item label="文章可见性">
          <el-radio-group v-model="publishForm.visibility">
            <el-radio label="public">公开</el-radio>
            <el-radio label="private">私密</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="评论设置">
          <el-switch
              v-model="publishForm.allowComment"
              active-text="允许评论"
              inactive-text="禁止评论"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="publishDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="publishArticle" :loading="isPublishing">
            确认发布
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片上传对话框 -->
    <el-dialog
        v-model="imageDialogVisible"
        title="插入图片"
        width="500px"
    >
      <el-tabs v-model="imageTabActive">
        <el-tab-pane label="本地上传" name="upload">
          <el-upload
              class="image-uploader"
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              :http-request="uploadImage"
              drag
          >
            <Upload class="icon" />
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png 文件，且不超过 5MB
              </div>
            </template>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="外链图片" name="url">
          <el-input
              v-model="imageUrl"
              placeholder="请输入图片链接"
          />
          <div class="dialog-footer">
            <el-button @click="insertImageUrl">确定</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 链接插入对话框 -->
    <el-dialog
        v-model="linkDialogVisible"
        title="插入链接"
        width="500px"
    >
      <el-form :model="linkForm" label-width="80px">
        <el-form-item label="链接文本">
          <el-input v-model="linkForm.text" placeholder="请输入链接显示的文本"/>
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="linkForm.url" placeholder="请输入链接地址"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="linkDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmInsertLink">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount,nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlock from '@tiptap/extension-code-block'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Eye,
  Bold,
  Italic,
  Underline,
  Image as ImageIcon,
  Link2,
  FileCode,
  Table2,
  Plus,
  Upload,
  Save,
  Send
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const articleId = ref(route.params.id)

// 编辑器状态
const editorRef = ref(null)
const editor = ref(null)
const isSaving = ref(false)
const isPublishing = ref(false)
const saveStatus = ref('所有更改已保存')

// 文章表单数据
const articleForm = reactive({
  title: '',
  content: '',
  htmlContent: '',
  categoryId: null,
  tags: [],
  coverImage: ''
})

// 发布对话框
const publishDialogVisible = ref(false)
const publishForm = reactive({
  timeType: 'now',
  scheduleTime: null,
  visibility: 'public',
  allowComment: true
})

// 标签输入
const inputTagVisible = ref(false)
const inputTag = ref('')
const tagInputRef = ref(null)

// 图片上传对话框
const imageDialogVisible = ref(false)
const imageTabActive = ref('upload')
const imageUrl = ref('')

// 链接对话框
const linkDialogVisible = ref(false)
const linkForm = reactive({
  text: '',
  url: ''
})

// 分类数据
const categories = ref([
  { id: 1, name: '健康讨论' },
  { id: 2, name: '生活分享' },
  { id: 3, name: '问题解答' },
  { id: 4, name: '经验交流' }
])

// 初始化编辑器
onMounted(() => {
  editor.value = new Editor({
    element: editorRef.value,
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlock
    ],
    content: '',
    onUpdate: ({ editor }) => {
      articleForm.content = editor.getText()
      articleForm.htmlContent = editor.getHTML()
      autoSave()
    }
  })

  // 如果有文章ID，加载文章内容
  if (articleId.value) {
    loadArticle()
  }

  // 设置自动保存
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// 编辑器功能方法
const handleFormat = (type) => {
  editor.value.chain().focus()[type]().run()
}

const isFormatActive = (type) => {
  return editor.value?.isActive(type) || false
}

const insertHeading = (level) => {
  editor.value.chain().focus().toggleHeading({ level: parseInt(level.substr(1)) }).run()
}

const insertImage = () => {
  imageDialogVisible.value = true
}

const insertLink = () => {
  linkDialogVisible.value = true
}

const insertCode = () => {
  editor.value.chain().focus().toggleCodeBlock().run()
}

const insertTable = () => {
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

// 标签相关方法
const showTagInput = () => {
  inputTagVisible.value = true
  nextTick(() => {
    tagInputRef.value.input.focus()
  })
}

const confirmTag = () => {
  if (inputTag.value) {
    if (!articleForm.tags.includes(inputTag.value)) {
      articleForm.tags.push(inputTag.value)
    }
  }
  inputTagVisible.value = false
  inputTag.value = ''
}

const removeTag = (tag) => {
  articleForm.tags = articleForm.tags.filter(t => t !== tag)
}

// ArticleEditor.vue (continued...)

// 图片上传相关方法
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const uploadImage = async ({ file }) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/articles/upload-image', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) throw new Error('上传失败')

    const { url } = await response.json()
    editor.value.chain().focus().setImage({ src: url }).run()
    imageDialogVisible.value = false
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  }
}

const insertImageUrl = () => {
  if (imageUrl.value) {
    editor.value.chain().focus().setImage({ src: imageUrl.value }).run()
    imageUrl.value = ''
    imageDialogVisible.value = false
  }
}

// 封面图片上传
const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('封面图片大小不能超过 2MB!')
    return false
  }
  return true
}

const uploadCover = async ({ file }) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/articles/upload-image', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) throw new Error('上传失败')

    const { url } = await response.json()
    articleForm.coverImage = url
    ElMessage.success('封面上传成功')
  } catch (error) {
    console.error('封面上传失败:', error)
    ElMessage.error('封面上传失败')
  }
}

// 链接插入方法
const confirmInsertLink = () => {
  if (linkForm.url) {
    editor.value
        .chain()
        .focus()
        .setLink({ href: linkForm.url, target: '_blank' })
        .run()

    linkDialogVisible.value = false
    linkForm.text = ''
    linkForm.url = ''
  }
}

// 文章保存和发布
const autoSave = debounce(async () => {  // 使用导入的 debounce
  if (!articleForm.title || !articleForm.content) return

  try {
    isSaving.value = true
    saveStatus.value = '正在保存...'

    const articleData = {
      ...articleForm,
      status: 0 // 草稿状态
    }

    if (articleId.value) {
      await updateArticle(articleData)
    } else {
      const response = await createArticle(articleData)
      articleId.value = response.id
      router.replace(`/editor/${response.id}`)
    }

    saveStatus.value = '所有更改已保存'
  } catch (error) {
    console.error('自动保存失败:', error)
    saveStatus.value = '保存失败'
    ElMessage.error('自动保存失败')
  } finally {
    isSaving.value = false
  }
}, 2000)

const saveDraft = async () => {
  try {
    isSaving.value = true
    const articleData = {
      ...articleForm,
      status: 0 // 草稿状态
    }

    if (articleId.value) {
      await updateArticle(articleData)
    } else {
      const response = await createArticle(articleData)
      articleId.value = response.id
      router.replace(`/editor/${response.id}`)
    }

    ElMessage.success('草稿保存成功')
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    isSaving.value = false
  }
}

const showPublishDialog = () => {
  if (!articleForm.title || !articleForm.content) {
    ElMessage.warning('请填写文章标题和内容')
    return
  }
  publishDialogVisible.value = true
}

const publishArticle = async () => {
  try {
    isPublishing.value = true

    const articleData = {
      ...articleForm,
      status: 1, // 发布状态
      scheduleTime: publishForm.timeType === 'schedule' ? publishForm.scheduleTime : null,
      visibility: publishForm.visibility,
      allowComment: publishForm.allowComment
    }

    if (articleId.value) {
      await updateArticle(articleData)
    } else {
      const response = await createArticle(articleData)
      articleId.value = response.id
    }

    publishDialogVisible.value = false
    ElMessage.success('文章发布成功')
    router.push(`/article/${articleId.value}`)
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('文章发布失败')
  } finally {
    isPublishing.value = false
  }
}

// API 方法
const createArticle = async (articleData) => {
  const response = await fetch('/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(articleData)
  })

  if (!response.ok) throw new Error('创建文章失败')
  return response.json()
}

const updateArticle = async (articleData) => {
  const response = await fetch(`/api/articles/${articleId.value}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(articleData)
  })

  if (!response.ok) throw new Error('更新文章失败')
  return response.json()
}

const loadArticle = async () => {
  try {
    const response = await fetch(`/api/articles/${articleId.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) throw new Error('加载文章失败')

    const article = await response.json()

    // 更新表单数据
    articleForm.title = article.title
    articleForm.content = article.content
    articleForm.categoryId = article.categoryId
    articleForm.tags = article.tags
    articleForm.coverImage = article.coverImage

    // 更新编辑器内容
    editor.value.commands.setContent(article.htmlContent)
  } catch (error) {
    console.error('加载文章失败:', error)
    ElMessage.error('加载文章失败')
  }
}

// 离开页面提示
const handleBeforeUnload = (e) => {
  if (isSaving.value) {
    e.preventDefault()
    e.returnValue = '文章正在保存，确定要离开吗？'
  }
}

// 导航方法
const goBack = () => {
  if (isSaving.value) {
    ElMessageBox.confirm(
        '文章正在保存，确定要离开吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      router.back()
    }).catch(() => {})
  } else {
    router.back()
  }
}

const previewArticle = () => {
  window.open(`/article/${articleId.value}/preview`, '_blank')
}
</script>

<style scoped>
.article-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 100;
}

.left-tools, .right-tools {
  display: flex;
  gap: 12px;
  align-items: center;
}

.preview-link {
  color: #409eff;
}

.save-status {
  color: #909399;
  font-size: 14px;
}

.save-status.saving {
  color: #e6a23c;
}

.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.editor-main {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.title-input {
  margin-bottom: 20px;
}

.title-input :deep(.el-input__inner) {
  font-size: 24px;
  height: 48px;
  padding: 0 20px;
}

.editor-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.editor-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 500px;
}

/* TipTap 编辑器样式 */
.editor-content :deep(.ProseMirror) {
  > * + * {
    margin-top: 0.75em;
  }

  ul, ol {
    padding: 0 1rem;
  }

  h1, h2, h3, h4, h5, h6 {
    line-height: 1.1;
    font-weight: 600;
  }

  code {
    background-color: rgba(97, 97, 97, 0.1);
    color: #616161;
    padding: 0.25em;
    border-radius: 0.25em;
  }

  pre {
    background: #0D0D0D;
    color: #FFF;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 3px solid #999;
    color: #666;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td, th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      background-color: #f8f9fa;
    }
  }
}

.editor-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.settings-card {
  position: sticky;
  top: 20px;
}

.cover-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #409EFF;
}

.cover-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 200px;
  line-height: 200px;
  text-align: center;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.tag-input {
  width: 90px;
  margin-right: 8px;
  vertical-align: bottom;
}

.image-uploader {
  text-align: center;
}

.image-uploader :deep(.el-upload-dragger) {
  width: 100%;
}

/* 编辑器工具栏按钮样式 */
.editor-toolbar .el-button {
  padding: 8px 12px;
}

.editor-toolbar .el-button.active {
  color: #409EFF;
  background-color: #ecf5ff;
}

/* 图标样式 */
.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  vertical-align: middle;
}

.editor-toolbar .icon {
  margin-right: 0;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #409eff;
}

.upload-placeholder .icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  color: #909399;
}

/* 深度选择器处理 Element Plus 组件样式 */
:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

</style>