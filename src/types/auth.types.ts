export interface User {
    username: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    role: string;
}

export interface LoginCredentials {
    userName: string; // Backend expects 'userName' based on AuthCredentials.java
    password: string;
}
