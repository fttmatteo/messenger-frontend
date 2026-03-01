import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.plak.messenger',
    appName: 'PLAK',
    webDir: 'dist',
    server: {
        cleartext: true,
        androidScheme: 'http'
    },
    plugins: {
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"],
        },
    },
};
export default config;
