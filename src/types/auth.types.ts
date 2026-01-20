/**
 * Representa la información básica de un usuario autenticado en el sistema.
 */
export interface User {
    id?: number;
    document?: number;
    role: string;
    name?: string;
    dealershipName?: string;
    isOnline?: boolean;
}

/**
 * Respuesta del servidor tras un login exitoso (formato técnico de tokens).
 */
export interface AuthResponse {
    token: string;
    refreshToken: string;
    role: string;
}

/**
 * Respuesta completa tras un intento de inicio de sesión, incluyendo metadatos de usuario.
 */
export interface LoginResponse {
    role: string;
    message: string;
    // El payload del usuario puede estar ausente o ser explícitamente null según la respuesta del backend
    user?: {
        id?: number;
        name?: string;
        document?: number;
        dealershipName?: string;
        role?: string;
    } | null;
}

/**
 * Credenciales requeridas para autenticar a un usuario mediante documento y contraseña.
 */
export interface LoginCredentials {
    document: number; // El backend espera 'document' (Long) según AuthCredentials.java
    password: string;
    rememberMe?: boolean;
}
