<template>
  <div class="article-container" ref="container">
    <div class="back-button">
      <el-button
          type="primary"
          class="custom-back-btn"
          icon="el-icon-arrow-left"
          @click="router.back()"
      >返回</el-button>
    </div>

    <div class="article-content">
      <el-card class="main-card">
        <!-- 文章头部 -->
        <div class="article-header">
          <h1 class="title">{{ article.title }}</h1>
          <div class="meta">
            <el-avatar
                :size="48"
                :src="article.author?.avatar"
                class="author-avatar"
            />
            <div class="info">
              <span class="author">{{ article.author?.username }}</span>
              <div class="details">
                <span class="detail-item">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(article.createdAt) }}
                </span>
                <span class="detail-item">
                  <el-icon><Folder /></el-icon>
                  {{ getCategoryName(article.categoryId) }}
                </span>
                <span class="detail-item">
                  <el-icon><View /></el-icon>
                  {{ article.viewCount }} 阅读
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 正文内容 -->
        <div class="article-body" v-html="article.htmlContent"></div>

        <!-- 标签 -->
        <div class="tags" v-if="article.tags?.length">
          <el-tag
              v-for="tag in article.tags"
              :key="tag"
              class="custom-tag"
              effect="plain"
          >
            # {{ tag }}
          </el-tag>
        </div>

        <!-- 操作栏 -->
        <div class="actions">
          <el-button
              type="primary"
              class="action-btn like-btn"
              :class="{ active: article.isLiked }"
              @click="handleLike"
          >
            <el-icon><ThumbsUp /></el-icon>
            {{ article.likeCount }} 点赞
          </el-button>
          <el-button
              type="success"
              class="action-btn favorite-btn"
              :class="{ active: article.isFavorited }"
              @click="handleFavorite"
          >
            <el-icon><Bookmark /></el-icon>
            {{ article.isFavorited ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 悬浮评论按钮 -->
    <div class="float-comment-btn" @click="showCommentDrawer = true">
      <el-badge :value="article.commentCount" :max="99">
        <el-button type="primary" circle>
          <el-icon><MessageSquare /></el-icon>
        </el-button>
      </el-badge>
    </div>

    <!-- 右侧评论抽屉 -->
    <el-drawer
        v-model="showCommentDrawer"
        direction="rtl"
        size="35%"
        :with-header="false"
        custom-class="comment-drawer"
        destroy-on-close
    >
      <div class="drawer-container">
        <!-- 评论抽屉头部 -->
        <div class="drawer-header">
          <h3>评论 {{ article.commentCount }}</h3>
          <el-button type="text" @click="showCommentDrawer = false">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <!-- 评论列表区域 -->
        <div class="drawer-content">
          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <el-avatar :size="40" :src="comment.user.avatar" class="comment-avatar" />
              <div class="comment-content">
                <div class="comment-info">
                  <span class="username">{{ comment.user.username }}</span>
                  <span class="time">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <div class="text">{{ comment.content }}</div>
                <div class="comment-actions">
                  <span class="reply-btn" @click="handleReplyClick(comment)">回复</span>
                </div>

                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <el-avatar :size="32" :src="reply.user.avatar" class="reply-avatar" />
                    <div class="reply-content">
                      <div class="reply-info">
                        <span class="username">{{ reply.user.username }}</span>
                        <span class="time">{{ formatDate(reply.createdAt) }}</span>
                      </div>
                      <div class="text">{{ reply.content }}</div>
                      <div class="comment-actions">
                        <span class="reply-btn" @click="handleReplyClick(comment, reply)">回复</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部评论输入框 -->
        <div class="drawer-footer">
          <div class="comment-input-container">
            <div class="input-header" v-if="activeComment">
              <span>回复 {{ replyToUser ? `@${replyToUser.username}` : '评论' }}</span>
              <el-button type="text" @click="cancelReply">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-input
                v-model="inputContent"
                type="textarea"
                :rows="3"
                :placeholder="activeComment ? replyPlaceholder : '写下你的评论...'"
                resize="none"
                class="comment-input"
            />
            <div class="input-footer">
              <el-button
                  type="primary"
                  :disabled="!inputContent.trim()"
                  @click="activeComment ? handleSubmitReply() : handleSubmitComment()"
              >
                {{ activeComment ? '发表回复' : '发表评论' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useStore } from 'vuex'
import {
  Star, Calendar, Folder, View, ThumbsUp,
  Bookmark, Delete, MessageSquare
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useStore()
const articleId = route.params.id

// 评论抽屉控制
const showCommentDrawer = ref(false)

const comments = ref([])
const inputContent = ref('')
const activeComment = ref(null)
const replyPlaceholder = ref('写下你的回复...')
const replyToUser = ref(null)

const article = ref({
  id: null,
  title: '',
  content: '',
  htmlContent: '',
  coverImage: '',
  categoryId: null,
  status: 1,
  visibility: 'public',
  allowComment: true,
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  author: {
    id: null,
    username: '',
    avatar: ''
  },
  tags: [],
  isLiked: false,
  isFavorited: false,
  createdAt: null,
  updatedAt: null,
  publishTime: null
})

const getCategoryName = (categoryId) => {
  const categoryMap = {
    1: '健康讨论',
    2: '生活分享',
    3: '问题解答',
    4: '经验交流'
  }
  return categoryMap[categoryId] || '未知分类'
}

const handleReplyClick = (parentComment, replyComment = null) => {
  if (!store.state.user) {
    ElMessage.warning('请先登录')
    return
  }

  activeComment.value = parentComment
  inputContent.value = ''

  if (replyComment) {
    replyToUser.value = replyComment.user
    replyPlaceholder.value = `回复 @${replyComment.user.username}`
    inputContent.value = `@${replyComment.user.username} `
  } else {
    replyToUser.value = null
    replyPlaceholder.value = '写下你的回复...'
  }
}

const cancelReply = () => {
  activeComment.value = null
  replyToUser.value = null
  replyPlaceholder.value = '写下你的回复...'
  inputContent.value = ''
}

// 获取文章详情
const fetchArticle = async () => {
  try {
    const userId = store.state.user?.id || 0
    const response = await fetch(`http://localhost:8088/api/articles/${userId}/${articleId}`)
    if (!response.ok) throw new Error('获取文章失败')

    const data = await response.json()
    console.log('完整响应数据:', data)

    if (data.code !== 200) {
      throw new Error(data.msg || '获取文章失败')
    }

    if (data.data) {
      article.value = {
        ...article.value,
        ...data.data,
        id: articleId
      }
      console.log('更新后的文章数据:', article.value)
      await incrementViewCount()
    } else {
      throw new Error('文章数据格式错误')
    }
  } catch (error) {
    console.error('获取文章详情错误:', error)
    ElMessage.error(error.message)
  }
}

// 增加阅读量
const incrementViewCount = async () => {
  try {
    const userId = store.state.user?.id || 0
    await fetch(`http://localhost:8088/api/articles/${userId}/${articleId}/view`, {
      method: 'POST'
    })
  } catch (error) {
    console.error('增加阅读量失败:', error)
  }
}

// 处理点赞
const handleLike = async () => {
  if (!store.state.user.id) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const userId = store.state.user.id
    const method = article.value.isLiked ? 'DELETE' : 'POST'
    const response = await fetch(
        `http://localhost:8088/api/articles/${articleId}/${userId}/like`,
        {
          method,
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
    )

    if (!response.ok) throw new Error('操作失败')

    const data = await response.json()
    if (data.code === 200 && data.data) {
      article.value = {
        ...article.value,
        ...data.data
      }
      ElMessage.success(article.value.isLiked ? '点赞成功' : '已取消点赞')
    } else {
      throw new Error(data.msg || '操作失败')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error(error.message)
  }
}

// 处理收藏
const handleFavorite = async () => {
  if (!store.state.user.id) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const userId = store.state.user.id
    const method = article.value.isFavorited ? 'DELETE' : 'POST'
    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}/${articleId}/favorite`,
        {
          method,
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
    )

    if (!response.ok) throw new Error('操作失败')

    article.value.isFavorited = !article.value.isFavorited
    ElMessage.success(article.value.isFavorited ? '收藏成功' : '已取消收藏')
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const userId = store.state.user?.id || 0
    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}/${articleId}/comments`
    )
    if (!response.ok) {
      throw new Error('获取评论失败')
    }
    const data = await response.json()
    if (data.code === 200 && data.data) {
      comments.value = data.data.comments
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 提交评论
const handleSubmitComment = async () => {
  if (!store.state.user) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const userId = store.state.user.id
    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}/${articleId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ content: inputContent.value })
        }
    )

    if (!response.ok) {
      throw new Error('评论失败')
    }

    const data = await response.json()
    if (data.code === 200 && data.data) {
      const newComment = {
        id: data.data.id,
        content: data.data.content,
        createdAt: data.data.createdAt,
        user: {
          id: store.state.user.id,
          username: store.state.user.username,
          avatar: store.state.user.avatar
        },
        replies: []
      }
      comments.value.unshift(newComment)
      article.value.commentCount++
      inputContent.value = ''
      ElMessage.success('评论成功')
    } else {
      throw new Error(data.msg || '评论失败')
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 提交回复
const handleSubmitReply = async () => {
  if (!store.state.user) {
    ElMessage.warning('请先登录')
    return
  }

  if (!activeComment.value) {
    ElMessage.warning('回复对象不存在')
    return
  }

  try {
    const userId = store.state.user.id
    const requestBody = {
      content: inputContent.value,
      parentId: activeComment.value.id
    }

    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}/${articleId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(requestBody)
        }
    )

    if (!response.ok) {
      throw new Error('回复失败')
    }

    const data = await response.json()
    if (data.code === 200 && data.data) {
      const newReply = {
        ...data.data,
        user: {
          id: store.state.user.id,
          username: store.state.user.username,
          avatar: store.state.user.avatar
        }
      }

      if (!activeComment.value.replies) {
        activeComment.value.replies = []
      }

      activeComment.value.replies.push(newReply)
      article.value.commentCount++
      inputContent.value = ''
      cancelReply()
      ElMessage.success('回复成功')
    } else {
      throw new Error(data.msg || '回复失败')
    }
  } catch (error) {
    console.error('Reply error:', error)
    ElMessage.error(error.message)
  }
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  console.log('当前文章ID:', articleId)
  if (!articleId) {
    error.value = '无效的文章ID'
    return
  }
  fetchArticle()
  fetchComments()
})
</script>

<style scoped>
/* 悬浮评论按钮样式 */
.float-comment-btn {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 99;
  transition: all 0.3s ease;
}

.float-comment-btn:hover {
  transform: translateY(-2px);
}

/* 评论抽屉样式 */
.comment-drawer {
  padding: 0 !important;
  overflow: hidden !important;
}

.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.drawer-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background-color: #fff;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.drawer-footer {
  border-top: 1px solid #eee;
  padding: 16px 20px;
  background: #fff;
  flex-shrink: 0;
}

.comment-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.comment-input {
  margin-bottom: 8px;
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 评论列表样式 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.username {
  font-weight: 600;
  color: #2c3e50;
}

.time {
  color: #64748b;
  font-size: 13px;
}

.text {
  color: #4b5563;
  line-height: 1.6;
  font-size: 14px;
  margin-bottom: 8px;
  word-wrap: break-word;
}

.comment-actions {
  margin-top: 8px;
}

.reply-btn {
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.reply-btn:hover {
  color: #66b1ff;
}

/* 回复列表样式 */
.replies-container {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.reply-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  margin-bottom: 8px;
}

.reply-item:not(:last-child) {
  border-bottom: 1px dashed #eee;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-info {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
}

/* 文章容器样式 */
.article-container {
  padding: 32px 5%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  position: relative;
}

.article-content {
  height: auto;
  overflow-y: visible;
}

/* 文章相关样式保持不变 */
.custom-back-btn {
  margin-bottom: 24px;
  padding: 10px 20px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.custom-back-btn:hover {
  transform: translateX(-4px);
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: #ffffff;
  margin-bottom: 24px;
}

.text a {
  color: #409eff;
  text-decoration: none;
  margin-right: 4px;
}

.article-header {
  margin-bottom: 32px;
  border-bottom: 1px solid #eee;
  padding-bottom: 24px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 24px;
  line-height: 1.4;
}

.meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.author {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.details {
  display: flex;
  gap: 16px;
  color: #64748b;
  font-size: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-body {
  line-height: 1.8;
  font-size: 16px;
  color: #374151;
  padding: 24px 0;
  overflow-wrap: break-word;  /* 添加这行 */
  word-wrap: break-word;      /* 添加这行 */
}

.el-card {
  overflow: visible;
}

.el-card__body {
  overflow: visible;
}

.tags {
  margin: 32px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.custom-tag {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background-color: #f3f4f6;
  border: none;
  color: #6b7280;
  transition: all 0.3s ease;
}

.custom-tag:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.action-btn {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.active {
  transform: scale(1.05);
}

.comment-section {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.comment-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.comment-input {
  margin: 24px 0;
}

.custom-input {
  margin-bottom: 16px;
}

.submit-comment-btn {
  width: 120px;
  padding: 12px 0;
  font-weight: 500;
  border-radius: 8px;
}

.comment-list {
  margin-top: 32px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background-color: #f8f9fa;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.comment-item:hover {
  background-color: #f3f4f6;
}

.comment-avatar {
  border: 2px solid #fff;
}

.comment-content {
  flex: 1;
}

.comment-info {
  margin-bottom: 8px;
}

.username {
  font-weight: 600;
  color: #2c3e50;
  margin-right: 12px;
}

.time {
  color: #64748b;
  font-size: 14px;
}

.text {
  color: #4b5563;
  line-height: 1.6;
  font-size: 15px;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .el-drawer {
    width: 85% !important;
  }

  .float-comment-btn {
    right: 20px;
    bottom: 20px;
  }

  .article-container {
    padding: 16px;
  }

  .comment-item, .reply-item {
    padding: 12px;
  }

  .drawer-header, .drawer-footer {
    padding: 12px 16px;
  }

  .drawer-content {
    padding: 16px;
  }

  .title {
    font-size: 24px;
  }

  .details {
    flex-direction: column;
    gap: 8px;
  }

  .actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>