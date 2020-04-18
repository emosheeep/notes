module.exports = (options, ctx) => {
  return {
    extend: '@vuepress/theme-default',
    plugins: [
      'vuepress-plugin-smooth-scroll',
      '@vuepress/back-to-top',
      '@vuepress/search'
    ]
  }
}