export interface User {
  user_id: number;
  name: string;
  email: string;
  password?: string; // No retornarem la contrasenya per seguretat
  created_at?: string;
  refresh_token?: string;
  role: string;
}

export interface UserSimplified {
  user_id: number;
  id: number;
  name: string;
  role: string;
}
