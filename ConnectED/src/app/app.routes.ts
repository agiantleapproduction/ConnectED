import { Routes } from '@angular/router';
import { Dashboard } from './components/home-components/dashboard/dashboard';
import { CommunityList } from './components/community-components/community-list/community-list';
import { MessageList } from './components/groupchat-components/message-list/message-list';
import { NewsFeed } from './components/news-components/news-feed/news-feed';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    title: 'Dashboard',
  },
  {
    path: 'community',
    component: CommunityList,
    title: 'Community List',
  },
  {
    path: 'groupchat',
    component: MessageList,
    title: 'Group Chat',
  },
  {
    path: 'news',
    component: NewsFeed,
    title: 'News Feed',
  },
];
