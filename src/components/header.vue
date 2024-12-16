<template>
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
  >
    <el-menu-item index="0" class="logo-container">
      <img class="logo" src="/src/assets/images/logo.png" alt="Element logo" />
    </el-menu-item>

    <div class="menu-items-left">
      <el-menu-item
          v-for="item in menuItems"
          :key="item.index"
          :index="item.index"
          @click="navigateTo(item.route)"
          class="menu-item-animated"
      >
        {{ item.label }}
      </el-menu-item>
    </div>

    <div class="menu-items-right">
      <template v-if="!isLoggedIn">
        <el-menu-item
            v-for="item in authItems"
            :key="item.index"
            :index="item.index"
            @click="navigateTo(item.route)"
            class="auth-item"
        >
          {{ item.label }}
        </el-menu-item>
      </template>

      <template v-else>
        <el-menu-item index="4">
          <el-button type="primary" class="record-button">
            <img src="/src/assets/images/icon/记录.png" alt="Edit Icon" class="icon-img" />
            <span>指标记录</span>
          </el-button>
        </el-menu-item>

        <el-menu-item index="notification" class="notification-item">
          <el-popover
              placement="bottom-end"
              :width="300"
              trigger="click"
              popper-class="notification-popover"
          >
            <template #reference>
              <el-badge :value="unreadCount" :hidden="!hasUnread" class="notification-badge">
                <Bell class="notification-icon" />
              </el-badge>
            </template>

            <div class="notification-container">
              <div class="notification-header">
                <span>通知</span>
                <el-button type="text" @click="markAllAsRead">全部标为已读</el-button>
              </div>
              <div class="notification-list">
                <template v-if="notifications.length">
                  <div v-for="notification in notifications"
                       :key="notification.id"
                       class="notification-item"
                       :class="{ 'unread': !notification.isRead }"
                       @click="handleNotificationClick(notification)">
                    <img :src="notification.sender?.avatar || defaultAvatar" class="sender-avatar" />
                    <div class="notification-content">
                      <div class="notification-message">{{ notification.message }}</div>
                      <div class="notification-time">{{ formatTime(notification.createTime) }}</div>
                    </div>
                  </div>
                </template>
                <div v-else class="empty-notifications">
                  暂无通知
                </div>
              </div>
            </div>
          </el-popover>
        </el-menu-item>

        <el-sub-menu index="3" class="user-menu">
          <template #title>
            <div class="user-info">
              <img
                  :src="userAvatar"
                  :alt="userName"
                  class="avatar"
                  @error="handleAvatarError"
              />
              <span class="user-name">{{ userName }}</span>
            </div>
          </template>

          <el-menu-item
              v-for="item in userMenuItems"
              :key="item.index"
              :index="item.index"
              @click="item.action"
              class="user-menu-item"
          >
            <img :src="item.icon" class="menu-icon" :alt="item.label" />
            {{ item.label }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </div>
  </el-menu>
</template>

<script setup>
import { ref, inject,computed,onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Bell } from 'lucide-vue-next';
import { ElMessage } from 'element-plus';

const router = useRouter();
const store = useStore();
const activeIndex = ref('1');
const isLoggedIn = inject('isLoggedIn');
const defaultAvatar = '/src/assets/images/avatar.png';

const user = computed(() => store.state.user);
const userName = computed(() => user.value?.username || 'User');
const userAvatar = computed(() => user.value?.avatar || defaultAvatar);

const notifications = ref([]);
const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);
const hasUnread = computed(() => unreadCount.value > 0);

// WebSocket 连接
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// 初始化 WebSocket 连接
const initWebSocket = () => {
  if (isLoggedIn.value && user.value?.id) {
    try {
      ws = new WebSocket(`ws://localhost:8088/api/ws/notifications/${user.value.id}`);
      
      ws.onopen = () => {
        console.log('WebSocket 连接成功');
        reconnectAttempts = 0; // 重置重连次数
      };
      
      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          notifications.value.unshift(notification);
          // 更新未读消息数
          unreadCount.value = notifications.value.filter(n => !n.isRead).length;
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        handleReconnect();
      };
      
      ws.onclose = () => {
        console.log('WebSocket连接关闭');
        handleReconnect();
      };
    } catch (error) {
      console.error('WebSocket初始化失败:', error);
      handleReconnect();
    }
  }
};

// 处理重连逻辑
const handleReconnect = () => {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // 指数退避，最大30秒
    console.log(`尝试第 ${reconnectAttempts} 次重连，延迟 ${delay}ms`);
    
    setTimeout(() => {
      if (ws?.readyState === WebSocket.CLOSED) {
        initWebSocket();
      }
    }, delay);
  } else {
    console.error('WebSocket重连失败，已达到最大重试次数');
    ElMessage.error('通知服务连接失败，请刷新页面重试');
  }
};

// 在组件卸载前关闭连接
onBeforeUnmount(() => {
  if (ws) {
    ws.close();
    ws = null;
  }
});

// 在用户登录状态改变时重新初始化WebSocket
watch(() => isLoggedIn.value, (newVal) => {
  if (newVal) {
    initWebSocket();
  } else if (ws) {
    ws.close();
    ws = null;
  }
});

// 获取通知列表
const fetchNotifications = async (retryCount = 3) => {
  if (!user.value?.id) return;
  
  try {
    const response = await fetch(`http://localhost:8088/api/notifications/${user.value.id}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    const data = await response.json();
    notifications.value = data.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    if (retryCount > 0) {
      setTimeout(() => {
        fetchNotifications(retryCount - 1);
      }, 3000);
    }
  }
};

// 标记所有通知为已读
const markAllAsRead = async () => {
  try {
    const response = await fetch(
        `http://localhost:8088/api/notifications/${user.value?.id}/mark-all-read`,
        { method: 'POST' }
    );
    if (!response.ok) throw new Error('Failed to mark notifications as read');
    notifications.value = notifications.value.map(n => ({ ...n, isRead: true }));
  } catch (error) {
    console.error('Error marking notifications as read:', error);
  }
};

// 处理通知点击
const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    try {
      await fetch(
          `http://localhost:8088/api/notifications/${user.value?.id}/${notification.id}/mark-read`,
          { method: 'POST' }
      );
      notification.isRead = true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // 根据通知类型导航到相应页面
  if (notification.type === 'comment') {
    router.push(`/article/${notification.articleId}`);
  } else if (notification.type === 'like') {
    router.push(`/article/${notification.articleId}`);
  }
};

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar;
};

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

onMounted(async () => {
  if (isLoggedIn.value) {
    try {
      console.log('头像：',userAvatar.value);
      await fetchNotifications();
      initWebSocket();
//await store.dispatch('getUserInfo'); // 确保在 Vuex 中实现此 action
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  }
});

const menuItems = [
  {index: '0', label: '首页', route: 'Home' },
  { index: '5', label: '健康中心', route: 'HealthCenter' },
  { index: '6', label: '论坛', route: 'Forum' }
];

const authItems = [
  { index: '1', label: '登录', route: 'Login' },
  { index: '2', label: '注册', route: 'Register' }
];

const userMenuItems = [
  {
    index: '3-1',
    label: '我的文章',
    icon: '/src/assets/images/icon/file.png',
    action: () => router.push({ name: 'MyArticles' })
  },
  {
    index: '3-2',
    label: '个人中心',
    icon: '/src/assets/images/icon/person.png',
    action: () => router.push({ name: 'EditInformation' })
  },
  {
    index: '3-3',
    label: '退出登录',
    icon: '/src/assets/images/icon/logout.png',
    action: () => store.dispatch('logoutUser')
  }
];

const navigateTo = (route) => router.push({ name: route });
const handleSelect = (key, keyPath) => console.log(key, keyPath);
</script>

<style scoped>
.el-menu-demo {
  display: flex;
  align-items: center;
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #ffffff;
}

/* Logo styles */
.logo-container {
  padding: 0 20px;
  transition: all 0.3s ease;
}

.logo {
  width: 100px;
  height: auto;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

/* Menu items styles */
.menu-items-left {
  display: flex;
  margin-right: auto;
  gap: 10px;
}

.menu-items-right {
  display: flex;
  align-items: center;
  margin-right: 20px;
  gap: 8px; /* Add gap between items */
}

.menu-item-animated {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;
  position: relative;
}

.menu-item-animated::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--el-color-primary);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.menu-item-animated:hover::after {
  width: 100%;
}

/* Auth items styles */
.auth-item {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;
}

.auth-item:hover {
  color: var(--el-color-primary);
}

/* Record button styles */
.record-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.record-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-img {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

/* Notification styles */
.notification-item {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 8px;
}

.notification-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.notification-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  z-index: 10;
}

.notification-icon {
  width: 24px;
  height: 24px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-icon:hover {
  color: var(--el-color-primary);
}

/* Notification popover styles */
.notification-container {
  max-height: 400px;
  overflow-y: auto;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.notification-list {
  padding: 8px 0;
}

.notification-list .notification-item {
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: auto;
}

.notification-list .notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread {
  background-color: #f0f9ff;
}

.sender-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.notification-content {
  flex: 1;
}

.notification-message {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.empty-notifications {
  padding: 24px;
  text-align: center;
  color: #909399;
}

/* User menu styles */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(64, 158, 255, 0.1);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  object-fit: cover;
}

.avatar:hover {
  transform: scale(1.1);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  transition: all 0.3s ease;
}

.user-menu-item:hover {
  background: rgba(64, 158, 255, 0.1);
}

.menu-icon {
  width: 18px;
  height: 18px;
  opacity: 0.8;
}
</style>