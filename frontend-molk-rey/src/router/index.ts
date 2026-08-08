import { createRouter, createWebHistory } from 'vue-router';

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
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: '', redirect: '/admin/buildings' },
        { path: 'buildings', component: () => import('../pages/admin/BuildingsManagement.vue') },
        { path: 'bills', component: () => import('../pages/admin/BillGeneration.vue') },
        { path: 'treasury', component: () => import('../pages/admin/TreasuryDashboard.vue') },
        { path: 'maintenance', component: () => import('../pages/admin/MaintenanceQueue.vue') },
        { path: 'notices', component: () => import('../pages/admin/NoticesManagement.vue') },
        { path: 'polls', component: () => import('../pages/admin/PollsManagement.vue') },
        { path: 'receipts', component: () => import('../pages/admin/ReceiptsReviewPage.vue') },
        { path: 'subscription', component: () => import('../pages/admin/SubscriptionManagement.vue') },
      ],
    },
    {
      path: '/resident',
      component: ResidentLayout,
      children: [
        { path: '', redirect: '/resident/home' },
        { path: 'home', component: () => import('../pages/resident/ResidentHome.vue') },
        { path: 'bills', component: () => import('../pages/resident/BillsAndPayment.vue') },
        { path: 'maintenance', component: () => import('../pages/resident/MaintenanceRequests.vue') },
        { path: 'notices', component: () => import('../pages/resident/NoticesFeed.vue') },
        { path: 'facilities', component: () => import('../pages/resident/FacilityReservation.vue') },
        { path: 'polls', component: () => import('../pages/resident/PollsAndVoting.vue') },
      ],
    },
    {
      path: '/platform',
      component: PlatformLayout,
      children: [
        { path: '', redirect: '/platform/subscriptions' },
        { path: 'subscriptions', component: () => import('../pages/platform/PlatformSubscriptionReview.vue') },
      ],
    },
  ],
});

export default router;
