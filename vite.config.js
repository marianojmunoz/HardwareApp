import { defineConfig } from 'vite';

export default defineConfig({
    root: 'frontend',
    envDir: '../',
    publicDir: 'public',
    build: {
        outDir: '../dist',
        emptyOutDir: true
    },
    server: {
        host: '0.0.0.0', // Permite acceso desde otros dispositivos en la red
        port: 3000,
        open: true
    }
});
