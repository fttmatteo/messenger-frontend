import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        exclude: [...configDefaults.exclude],
        setupFiles: './src/test/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/lib/**', 'src/hooks/**', 'src/services/**', 'src/components/**'],
            exclude: ['node_modules/**', 'src/test/**', 'src/components/ui/*.test.tsx'],
            thresholds: {
                statements: 11,
                branches: 9,
                functions: 11,
                lines: 11,
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
