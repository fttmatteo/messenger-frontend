/**
 * Servicio API de Autenticación
 * 
 * Funciones básicas para auth.
 * Para implementar login y refresh token según el backend.
 */

import axiosClient from '@/config/axios-client'
import { AuthResponse, LoginCredentials } from '@/types'

/**
 * Base URL para endpoints de autenticación
 */
const AUTH_URL = '/auth'

/**
 * Realiza login con credenciales
 * @param credentials - Usuario y contraseña
 * @returns Respuesta con tokens y datos del usuario
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>(`${AUTH_URL}/login`, credentials)
    return response.data
}

/**
 * Refresca el access token usando el refresh token
 * @param refreshToken - Token de refresco
 * @returns Nueva respuesta con tokens actualizados
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>(`${AUTH_URL}/refresh`, { refreshToken })
    return response.data
}
