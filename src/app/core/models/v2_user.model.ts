export interface User {
  user_id: number;
  name: string;
  email: string;
  password?: string; // No retornarem la contrasenya per seguretat
  created_at?: string;
  role?: boolean; // Llista de noms de rols associats a l'usuari
}

export interface UserSimplified {
  userId: number;
  id: number;
  name: string;
  role: boolean;
  following?: boolean; // Indica si l'usuari està seguint a l'usuari actual
  follows_you?: number; // Nombre de seguidors de l'usuari
}
