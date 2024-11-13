<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <el-carousel height="500px" indicator-position="outside">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-content" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-text">
              <h1>{{ banner.title }}</h1>
              <p>{{ banner.description }}</p>
              <el-button type="primary" size="large" @click="navigateTo(banner.link)">
                了解更多
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- Quick Access Section -->
    <section class="quick-access">
      <div class="section-title">
        <h2>快捷功能</h2>
        <span>便捷管理您的健康数据</span>
      </div>
      <el-row :gutter="20">
        <el-col v-for="item in quickAccess" :key="item.id" :xs="12" :sm="8" :md="6">
          <el-card class="quick-access-card" shadow="hover" @click="navigateTo(item.link)">
            <img :src="item.icon" :alt="item.title" class="quick-icon" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- Health Insights Section -->
    <section class="health-insights">
      <div class="section-title">
        <h2>健康洞察</h2>
        <span>专业的健康建议与文章</span>
      </div>
      <el-row :gutter="20">
        <el-col v-for="article in healthArticles" :key="article.id" :xs="24" :sm="12" :md="8">
          <el-card class="article-card" shadow="hover">
            <img :src="article.image" :alt="article.title" class="article-image" />
            <div class="article-content">
              <h3>{{ article.title }}</h3>
              <p>{{ article.summary }}</p>
              <div class="article-footer">
                <span>{{ article.date }}</span>
                <el-button type="text" @click="navigateTo(article.link)">
                  阅读更多
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- Community Section -->
    <section class="community-section">
      <div class="section-title">
        <h2>社区动态</h2>
        <span>发现来自社区的分享与讨论</span>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="16">
          <div class="hot-topics">
            <h3>热门话题</h3>
            <el-card v-for="topic in hotTopics" :key="topic.id" class="topic-card" shadow="hover">
              <div class="topic-header">
                <el-avatar :src="topic.authorAvatar" size="small" />
                <span class="author-name">{{ topic.author }}</span>
                <span class="topic-time">{{ topic.time }}</span>
              </div>
              <div class="topic-content">
                <h4>{{ topic.title }}</h4>
                <p>{{ topic.preview }}</p>
              </div>
              <div class="topic-footer">
                <span><i class="el-icon-view"></i> {{ topic.views }}</span>
                <span><i class="el-icon-chat-dot-round"></i> {{ topic.comments }}</span>
                <span><i class="el-icon-star-off"></i> {{ topic.likes }}</span>
              </div>
            </el-card>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="community-stats">
            <el-card shadow="never" class="stats-card">
              <h3>社区数据</h3>
              <div class="stat-item">
                <div class="stat-value">{{ communityStats.members }}</div>
                <div class="stat-label">活跃会员</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ communityStats.posts }}</div>
                <div class="stat-label">总帖子数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ communityStats.todayPosts }}</div>
                <div class="stat-label">今日新帖</div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Banner数据
const banners = ref([
  {
    id: 1,
    title: '科学管理健康数据',
    description: '使用智能工具追踪您的健康指标',
    image: '/src/assets/images/banner1.jpg',
    link: 'HealthCenter'
  },
  {
    id: 2,
    title: '加入健康社区',
    description: '与志同道合的人分享经验和建议',
    image: '/src/assets/images/banner2.jpg',
    link: 'Forum'
  }
]);

// 快捷功能
const quickAccess = ref([
  {
    id: 1,
    title: '健康记录',
    description: '记录日常健康数据',
    icon: '/src/assets/images/icon/health-record.png',
    link: 'HealthRecord'
  },
  {
    id: 2,
    title: '数据分析',
    description: '查看健康趋势分析',
    icon: '/src/assets/images/icon/analysis.png',
    link: 'Analysis'
  },
  {
    id: 3,
    title: '健康社区',
    description: '参与健康话题讨论',
    icon: '/src/assets/images/icon/community.png',
    link: 'Forum'
  },
  {
    id: 4,
    title: '在线咨询',
    description: '专业医生在线解答',
    icon: '/src/assets/images/icon/consultation.png',
    link: 'Consultation'
  }
]);

// 健康文章
const healthArticles = ref([
  {
    id: 1,
    title: '科学饮食指南：平衡营养的重要性',
    summary: '了解如何通过均衡饮食提升身体健康状况...',
    image: '/src/assets/images/article1.jpg',
    date: '2024-03-15',
    link: 'article/1'
  },
  // ... 更多文章
]);

// 热门话题
const hotTopics = ref([
  {
    id: 1,
    author: '健康达人',
    authorAvatar: '/src/assets/images/avatar1.jpg',
    title: '分享：我的运动减重经历',
    preview: '坚持运动三个月，成功减重15公斤...',
    time: '2小时前',
    views: 1234,
    comments: 56,
    likes: 89
  },
  // ... 更多话题
]);

// 社区统计
const communityStats = ref({
  members: '12,345',
  posts: '45,678',
  todayPosts: '123'
});

const navigateTo = (route) => {
  router.push({ name: route });
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  overflow-y: auto;
  /* 隐藏滚动条但保持滚动功能 */
  -ms-overflow-style: none;
  scrollbar-width: none;
}
/* 针对 Webkit 浏览器隐藏滚动条 */
.home-container::-webkit-scrollbar {
  display: none;
}

/* 确保各个section的间距合理 */
.hero-section,
.quick-access,
.health-insights,
.community-section {
  margin-bottom: 40px;
}

/* 调整 carousel 高度，避免在小屏幕上太高 */
.hero-section .el-carousel {
  height: auto;
}

.hero-section .el-carousel__item {
  height: 400px; /* 降低轮播图高度 */
}
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero-section {
  margin-bottom: 40px;
}

.banner-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  padding: 0 60px;
}

.banner-text {
  max-width: 500px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-text h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
}

.section-title {
  text-align: center;
  margin-bottom: 30px;
}

.section-title h2 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.section-title span {
  color: #909399;
  font-size: 16px;
}

.quick-access-card {
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-access-card:hover {
  transform: translateY(-5px);
}

.quick-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
}

.article-card {
  margin-bottom: 20px;
  overflow: hidden;
}

.article-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.article-content {
  padding: 15px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  color: #909399;
}

.topic-card {
  margin-bottom: 15px;
}

.topic-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.author-name {
  font-weight: 500;
}

.topic-time {
  color: #909399;
  font-size: 12px;
  margin-left: auto;
}

.topic-footer {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  color: #909399;
}

.stats-card {
  text-align: center;
  padding: 20px;
}

.stat-item {
  margin: 15px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.stat-label {
  color: #909399;
  margin-top: 5px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .banner-content {
    padding: 0 20px;
  }

  .banner-text h1 {
    font-size: 2em;
  }

  .quick-access-card {
    margin-bottom: 15px;
  }
}
</style>