export interface User {
    id?: number;
    document?: number;
    role: string;
    isOnline?: boolean;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    role: string;
}

export interface LoginCredentials {
    document: number; // Backend expects 'document' (Long) based on AuthCredentials.java
    password: string;
    rememberMe?: boolean;
}
