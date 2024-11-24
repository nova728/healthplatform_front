<template>
  <div class="forum-container">
    <div class="forum">
      <!-- 顶部搜索和发帖区域 -->
      <div class="forum-header">
        <el-input
            v-model="searchText"
            placeholder="搜索文章..."
            class="search-input"
            :prefix-icon="Search"
            @input="handleSearch"
        />
        <el-button type="primary" @click="navigateToEditor">
          <el-icon><Plus /></el-icon>发布文章
        </el-button>
      </div>

      <!-- 主要内容区域 -->
      <div class="forum-content">
        <!-- 左侧分类列表 -->
        <div class="forum-categories">
          <div class="category-title">板块分类</div>
          <el-menu
              :default-active="activeCategory.toString()"
              @select="handleCategorySelect">
            <el-menu-item
                v-for="category in categories"
                :key="category.id"
                :index="category.id.toString()"
            >
              <el-icon><component :is="category.icon" /></el-icon>
              <span>{{ category.name }}</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 右侧文章列表 -->
        <div class="posts-list">
          <el-empty v-if="posts.length === 0" description="暂无文章" />

          <el-card v-else v-for="post in posts" :key="post.id" class="post-card" @click="viewPost(post.id)">
            <div class="post-header">
              <el-avatar :size="40" :src="post.author?.avatar" />
              <div class="post-info">
                <div class="post-title">{{ post.title }}</div>
                <div class="post-meta">
                  <span>{{ post.author?.username }}</span>
                  <span>{{ formatDate(post.createdAt) }}</span>
                  <span>{{ getCategoryName(post.categoryId) }}</span>
                  <span v-if="post.visibility === 'private'" class="private-tag">
                    <el-icon><Lock /></el-icon>私密
                  </span>
                </div>
              </div>
            </div>
            <div class="post-content">{{ post.content }}</div>
            <div class="post-cover" v-if="post.coverImage">
              <el-image
                  :src="post.coverImage"
                  fit="cover"
                  :preview-src-list="[post.coverImage]"
              />
            </div>
            <div class="post-footer">
              <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
              <span><el-icon><ChatRound /></el-icon> {{ post.commentCount }}</span>
              <span @click.stop="handleLike(post)" :class="{ 'active': post.isLiked }">
                <el-icon><Star /></el-icon> {{ post.likeCount }}
              </span>
              <span @click.stop="handleFavorite(post)" :class="{ 'active': post.isFavorited }">
                 <el-icon><Collection /></el-icon>
                 {{ post.isFavorited ? '已收藏' : '收藏' }}
              </span>
            </div>
            <div class="post-tags" v-if="post.tags && post.tags.length">
              <el-tag
                  v-for="tag in post.tags"
                  :key="tag"
                  size="small"
                  class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-card>

          <!-- 分页 -->
          <div class="pagination" v-if="total > 0">
            <el-pagination
                background
                layout="total, sizes, prev, pager, next"
                :total="total"
                :page-size="pageSize"
                :page-sizes="[10, 20, 30, 50]"
                :current-page="currentPage"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Search,
  Plus,
  ChatDotRound,
  QuestionFilled,
  Lock,
  Collection
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import {useStore} from 'vuex'

import {
  Sun as Sunny,
  Medal,
  Eye as View,
  MessageCircle as ChatRound,
  Star,
} from 'lucide-vue-next'

const router = useRouter()
const searchText = ref('')
const activeCategory = ref(0)
const posts = ref([])
const store=useStore();
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)

// 分类数据
const categories = ref([
  { id: 1, name: '健康讨论', icon: 'ChatDotRound' },
  { id: 2, name: '生活分享', icon: 'Sunny' },
  { id: 3, name: '问题解答', icon: 'QuestionFilled' },
  { id: 4, name: '经验交流', icon: 'Medal' }
])

// 获取文章列表
const fetchArticles = async () => {
  try {
    isLoading.value = true;
    const userId = store.state.user.id;

    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}?categoryId=${activeCategory.value || ''}&page=${currentPage.value}&size=${pageSize.value}&search=${searchText.value}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (responseData.code === 200 && responseData.data) {
      posts.value = responseData.data.articles || [];
      total.value = responseData.data.total || 0;
    } else {
      console.warn('Unexpected response structure:', responseData);
      posts.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    ElMessage.error(error.message || '获取文章列表失败');
    posts.value = [];
    total.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : ''
}

// 处理分类选择
const handleCategorySelect = (key) => {
  activeCategory.value = parseInt(key)
  currentPage.value = 1
  fetchArticles()
}

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchArticles()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchArticles()
}

// 处理搜索
const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchArticles()
}, 300)

// 处理点赞
const handleLike = async (post) => {
  try {
    if (!localStorage.getItem('token')) {
      ElMessage.warning('请先登录')
      return
    }

    const url = `http://localhost:8088/api/articles/${post.id}/like`
    const method = post.isLiked ? 'DELETE' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) throw new Error('操作失败')

    post.isLiked = !post.isLiked
    post.likeCount += post.isLiked ? 1 : -1

    ElMessage.success(post.isLiked ? '点赞成功' : '已取消点赞')
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 处理收藏
const handleFavorite = async (post) => {
  try {
    if (!localStorage.getItem('token')) {
      ElMessage.warning('请先登录')
      return
    }

    const url = `http://localhost:8088/api/articles/${post.id}/favorite`
    const method = post.isFavorited ? 'DELETE' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) throw new Error('操作失败')

    post.isFavorited = !post.isFavorited
    ElMessage.success(post.isFavorited ? '收藏成功' : '已取消收藏')
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 跳转到编辑器
const navigateToEditor = () => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    return
  }
  router.push('/article/editor')
}

// 查看文章详情
const viewPost = (id) => {
  router.push(`/article/${id}`)
}

// 初始化加载
onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.forum-container {
  padding: 20px 40px;
  height: calc(100% - 40px);
  background-color: #f5f7fa;
}

.forum {
  height: 100%;
  width: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.forum-header {
  padding: 20px;
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.search-input {
  max-width: 300px;
}

.forum-content {
  flex: 1;
  display: flex;
  height: calc(100% - 80px);
  overflow: hidden;
}

.forum-categories {
  width: 200px;
  border-right: 1px solid #e6e6e6;
  background-color: white;
}

.category-title {
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  border-bottom: 1px solid #e6e6e6;
}

.posts-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.post-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.post-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.post-info {
  flex: 1;
}

.post-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.post-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 12px;
  align-items: center;
}

.private-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e6a23c;
}

.post-content {
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-cover {
  margin: 12px 0;
  max-height: 200px;
  overflow: hidden;
  border-radius: 4px;
}

.post-cover .el-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-footer {
  display: flex;
  gap: 16px;
  color: #909399;
  font-size: 14px;
}

.post-footer span {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.post-footer span:hover,
.post-footer span.active {
  color: #409eff;
}

.post-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 滚动条样式 */
.posts-list::-webkit-scrollbar {
  width: 6px;
}

.posts-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.posts-list::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

/* 加载状态 */
.post-card.is-loading {
  pointer-events: none;
  opacity: 0.7;
}
</style>