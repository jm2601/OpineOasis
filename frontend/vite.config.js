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
        post: path.resolve(__dirname, 'login/post.html'),
      }
    }
  },
  plugins: [react()],
})
