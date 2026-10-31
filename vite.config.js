import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@artifacts': 'C:/Users/Surface Pro8/.gemini/antigravity-ide/brain/b9963fae-c543-4147-8a95-80e35c94545b'
    }
  },
  server: {
    fs: {
      allow: [
        'c:/laragon/www/my-portfolio',
        'C:/Users/Surface Pro8/.gemini/antigravity-ide/brain/b9963fae-c543-4147-8a95-80e35c94545b'
      ]
    }
  }
})
