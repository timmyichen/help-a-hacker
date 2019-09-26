export interface User {
  name: string;
}

export interface AppStore {
  user: User | null;
}
