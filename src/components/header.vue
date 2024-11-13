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

        <el-sub-menu index="3" class="user-menu">
          <template #title>
            <div class="user-info">
              <img src="/src/assets/images/avatar.png" alt="User Avatar" class="avatar" />
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
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();
const activeIndex = ref('1');
const isLoggedIn = inject('isLoggedIn');
const userName = ref('User');

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
    label: '个人资料',
    icon: '/src/assets/images/icon/file.png',
    action: () => router.push({ name: 'EditInformation' })
  },
  {
    index: '3-2',
    label: '设置',
    icon: '/src/assets/images/icon/set.png',
    action: () => router.push({ name: 'Setting' })
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

.menu-items-left {
  display: flex;
  margin-right: auto;
  gap: 10px;
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

.menu-items-right {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.auth-item {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;
}

.auth-item:hover {
  color: var(--el-color-primary);
}

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