import { Preferences } from '@capacitor/preferences';

export const setPreference = async (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch { /* ignore */ }
    
    try {
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        const maxAge = `max-age=${365 * 24 * 60 * 60}`;
        const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${key}=${encodeURIComponent(value)}; ${expires}; ${maxAge}; path=/; SameSite=Lax${isSecure}`;
    } catch { /* ignore */ }
    
    try {
        await Preferences.set({ key, value });
    } catch { /* ignore */ }
};

export const removePreference = async (key: string) => {
    try {
        localStorage.removeItem(key);
    } catch { /* ignore */ }
    
    try {
        const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax${isSecure}`;
    } catch { /* ignore */ }
    
    try {
        await Preferences.remove({ key });
    } catch { /* ignore */ }
};

export const getPreferenceSync = (key: string): string | null => {
    try {
        const val = localStorage.getItem(key);
        if (val) return val;
    } catch { /* ignore */ }
    
    try {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${key}=`);
        if (parts.length === 2) {
            const cookieVal = parts.pop()?.split(';').shift();
            if (cookieVal) return decodeURIComponent(cookieVal);
        }
    } catch { /* ignore */ }
    
    return null;
};

export const getPreferenceAsync = async (key: string): Promise<string | null> => {
    const syncVal = getPreferenceSync(key);
    if (syncVal) return syncVal;

    try {
        const { value } = await Preferences.get({ key });
        if (value) {
            // Self-healing: if found in Capacitor but missing in web storage, restore it to all layers
            await setPreference(key, value);
            return value;
        }
    } catch { /* ignore */ }
    return null;
};
