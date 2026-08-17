import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore, type UserRole } from '../stores/useAuthStore';

const AdminLayout = () => import('../layouts/AdminLayout.vue');
const ResidentLayout = () => import('../layouts/ResidentLayout.vue');
const MarketingLayout = () => import('../layouts/MarketingLayout.vue');
const PlatformLayout = () => import('../layouts/PlatformLayout.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MarketingLayout,
      children: [
        { path: '', component: () => import('../pages/marketing/LandingPage.vue') },
        { path: 'about', component: () => import('../pages/marketing/AboutPage.vue') },
        { path: 'contact', component: () => import('../pages/marketing/ContactPage.vue') },
        { path: 'help', component: () => import('../pages/marketing/HelpPage.vue') },
      ],
    },
    {
      path: '/login',
      component: () => import('../pages/auth/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      component: () => import('../pages/auth/RegisterPage.vue'),
      meta: { public: true },
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { roles: ['admin', 'board_member'] },
      children: [
        { path: '', redirect: '/admin/buildings' },
        { path: 'buildings', component: () => import('../pages/admin/BuildingsManagement.vue') },
        { path: 'bills', component: () => import('../pages/admin/BillGeneration.vue') },
        { path: 'treasury', component: () => import('../pages/admin/TreasuryDashboard.vue') },
        { path: 'maintenance', component: () => import('../pages/admin/MaintenanceQueue.vue') },
        { path: 'notices', component: () => import('../pages/admin/NoticesManagement.vue') },
        { path: 'polls', component: () => import('../pages/admin/PollsManagement.vue') },
        { path: 'receipts', component: () => import('../pages/admin/ReceiptsReviewPage.vue') },
        // { path: 'subscription', component: () => import('../pages/admin/SubscriptionManagement.vue') },
        { path: 'profile', component: () => import('../pages/common/ProfilePage.vue') },
      ],
    },
    {
      path: '/resident',
      component: ResidentLayout,
      meta: { roles: ['resident', 'owner'] },
      children: [
        { path: '', redirect: '/resident/home' },
        { path: 'home', component: () => import('../pages/resident/ResidentHome.vue') },
        { path: 'bills', component: () => import('../pages/resident/BillsAndPayment.vue') },
        { path: 'maintenance', component: () => import('../pages/resident/MaintenanceRequests.vue') },
        { path: 'notices', component: () => import('../pages/resident/NoticesFeed.vue') },
        { path: 'facilities', component: () => import('../pages/resident/FacilityReservation.vue') },
        { path: 'polls', component: () => import('../pages/resident/PollsAndVoting.vue') },
        { path: 'profile', component: () => import('../pages/common/ProfilePage.vue') },
      ],
    },
    {
      path: '/platform',
      component: PlatformLayout,
      meta: { roles: ['platform_admin'] },
      children: [
        { path: '', redirect: '/platform/dashboard' },
        { path: 'dashboard', component: () => import('../pages/platform/PlatformDashboard.vue') },
        { path: 'subscriptions', component: () => import('../pages/platform/PlatformSubscriptionReview.vue') },
        { path: 'users', component: () => import('../pages/platform/PlatformUsersManagement.vue') },
        { path: 'buildings', component: () => import('../pages/platform/PlatformBuildingsManagement.vue') },
        { path: 'profile', component: () => import('../pages/common/ProfilePage.vue') },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../pages/NotFoundPage.vue'),
      meta: { public: true },
    },
  ],

  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return { ...savedPosition, behavior: 'smooth' };
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 };
    }
    return { top: 0, behavior: 'smooth' };
  },
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  const requiredRoles = to.matched.flatMap((record) => (record.meta.roles as UserRole[]) ?? []);

  if (requiredRoles.length === 0) {
    return true;
  }

  if (!authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (!authStore.role || !requiredRoles.includes(authStore.role)) {
    return { path: authStore.getHomeRouteForRole(authStore.role) };
  }

  return true;
});

export default router;
