module.exports = {
  packagerConfig: {
    asar: true,
    darwinDarkModeSupport: 'true',
    // Electron-forge automatically adds the file extension based on OS
    //   icon: './resources/icons/icon',
  },
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [{
              html: './src/index.htm',
              js: './src/renderer.ts',
              name: 'main_window'
            }
          ]
        }
      }
    ]
  ]
}
