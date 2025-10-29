import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Production optimizations
      babel: {
        compact: true,
      }
    })
  ],
  base: '/', // Ensure proper base path for production
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps in production
    minify: 'terser', // Use terser for better minification
    
    // Optimize chunk sizes
    chunkSizeWarningLimit: 1000,
    
    // Terser options for production
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      },
      format: {
        comments: false // Remove all comments
      }
    },
    
    rollupOptions: {
      output: {
        // Optimize chunking strategy
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Material-UI core
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          
          // Material-UI icons (separate chunk)
          'mui-icons': ['@mui/icons-material'],
          
          // API and utilities
          'utils': ['axios', 'react-query', 'date-fns'],
          
          // Form libraries
          'forms': ['formik', 'yup'],
          
          // Charts
          'charts': ['recharts']
        },
        
        // Optimize file naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          // Organize assets by type
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          } else {
            return `assets/[ext]/[name]-[hash][extname]`
          }
        }
      }
    },
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs']
    }
  },
  
  // Production optimizations
  esbuild: {
    drop: ['console', 'debugger'], // Remove console and debugger in production
    legalComments: 'none'
  },
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/backend/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  preview: {
    port: 5173,
    host: true
  }
})
