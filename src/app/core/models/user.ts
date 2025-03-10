export interface User {
  user_id: number;
  name: string;
  email: string;
  password?: string; // No retornarem la contrasenya per seguretat
  created_at?: string;
  roles?: string[]; // Llista de noms de rols associats a l'usuari
}
