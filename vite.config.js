export default {
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        layanan: 'layanan.html',
        tentang: 'tentang.html',
        kontak: 'kontak.html'
      }
    }
  }
} 