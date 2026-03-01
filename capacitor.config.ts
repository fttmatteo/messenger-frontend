import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.plak.messenger',
    appName: 'PLAK',
    webDir: 'dist',
    server: {
        cleartext: false,
        androidScheme: 'https'
    },
    android: {
        useLegacyBridge: true
    },
    plugins: {
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"],
        },
        StatusBar: {
            overlaysWebView: true
        }
    },
};
export default config;
