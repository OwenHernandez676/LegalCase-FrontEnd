import { Role } from './enums';

export interface User {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: Role;
  especialidad?: string;
  cargaTrabajo?: number;
  calificacion?: number;
  casos?: number;
  activo: boolean;
  avatar?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface LoginCredentials {
  correo: string;
  contrasena: string;
  rol: Role;
}
