import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        community: path.resolve(__dirname, 'community/index.html'),
        login: path.resolve(__dirname, 'login/index.html'),
        post: path.resolve(__dirname, 'post/index.html'),
        settings: path.resolve(__dirname, 'settings/index.html'),
        user: path.resolve(__dirname, 'user/index.html'),
      }
    }
  },
  plugins: [react()],
})
