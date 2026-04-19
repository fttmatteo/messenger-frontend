import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import pkg from './package.json';

export default defineConfig({
    plugins: [react()],
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    test: {
        environment: 'jsdom',
        globals: true,
        exclude: [...configDefaults.exclude, 'e2e/**'],
        setupFiles: './src/test/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'src/main.tsx',
                'src/vite-env.d.ts',
                'src/types/**/*',
                'src/config/**/*',
                'src/test/**/*',
                '**/index.ts',
                '**/*.d.ts',
            ],
            thresholds: {
                statements: 20,
                branches: 20,
                functions: 20,
                lines: 20,
            }
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
