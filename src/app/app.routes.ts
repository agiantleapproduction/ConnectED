import { Routes } from '@angular/router';
import { Dashboard } from './components/home-components/dashboard/dashboard';
import { CommunityList } from './components/community-components/community-list/community-list';
import { MessageList } from './components/groupchat-components/message-list/message-list';
import { NewsFeed } from './components/news-components/news-feed/news-feed';
import { Login } from './components/login/login';
import { authGuard } from './guards/auth.guard';
import { NewUser } from './components/new-user/new-user';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    title: 'Login',
  },
  {
    path: '',
    component: Dashboard,
    title: 'Dashboard',
    canActivate: [authGuard],
  },
  {
    path: 'community',
    component: CommunityList,
    title: 'Community List',
    canActivate: [authGuard],
  },
  {
    path: 'community/:id',
    component: MessageList,
    title: 'Group Chats',
    canActivate: [authGuard],
  },
  {
    path: 'groupchat',
    component: MessageList,
    title: 'Group Chat',
    canActivate: [authGuard],
  },
  {
    path: 'news',
    component: NewsFeed,
    title: 'News Feed',
    canActivate: [authGuard],
  },
  {
    path: 'new-user',
    component: NewUser,
    title: 'Create Account',
  },
];
