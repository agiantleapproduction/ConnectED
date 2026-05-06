import { Routes } from '@angular/router';
import { Dashboard } from './components/home-components/dashboard/dashboard';
import { CommunityList } from './components/community-components/community-list/community-list';
import { GroupCard } from './components/community-components/group-card/group-card';
import { MyChatsPage } from './components/groupchat-components/my-chats-page/my-chats-page';
import { GroupChatPage } from './components/groupchat-components/group-chat-page/group-chat-page';
import { NewsFeed } from './components/news-components/news-feed/news-feed';
import { Login } from './components/login/login';
import { authGuard } from './guards/auth.guard';
import { NewUser } from './components/new-user/new-user';
import { Profile } from './components/profile/profile';

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
    component: GroupCard,
    title: 'Group Chats',
    canActivate: [authGuard],
  },
  {
    path: 'groupchat',
    component: MyChatsPage,
    title: 'My Group Chats',
    canActivate: [authGuard],
  },
  {
    path: 'groupchat/:id',
    component: GroupChatPage,
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
    path: 'profile',
    component: Profile,
    title: 'My Profile',
    canActivate: [authGuard],
  },
  {
    path: 'new-user',
    component: NewUser,
    title: 'Create Account',
  },
];
