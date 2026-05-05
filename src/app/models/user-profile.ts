export type UserRole = 'student' | 'teacher';
export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  major: string | null;
  department: string | null;
  groupChatIds: string[]; // list of group chat IDs the user has joined
}
