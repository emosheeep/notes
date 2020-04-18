const categories = require('./utils/readDir.js')

module.exports = {
  title: '情绪羊的笔记本',
  description: '个人技术博客，方向为前端开发，用来记录学习过程中遇到的问题',
  head: [
    ['link', { rel: 'stylesheet', href: 'https://cdn.staticfile.org/normalize/8.0.1/normalize.min.css' }],
    ['script', { src: '//cdn.jsdelivr.net/npm/leancloud-storage@4.5.0/dist/av-min.js', defer: true }],
    ['meta', { name: 'keywords', content: '博客,前端,笔记本' }],
    ['meta', { name: 'athor', content: '秦旭洋' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
    // ['link', { rel: 'stylesheet', href: '//lib.baomitu.com/prism/latest/themes/prism.min.css' }],
  ],
  markdown: {
    extractHeaders: ['h1', 'h2', 'h3'] // 提取标题
  },
  themeConfig: {
    lastUpdated: 'Last Modified',
    sidebar: false,
    nav: [
      { text: 'Home', link: '/' },
      { text: '博客', link: 'https://blog.biubiubius.com', target: '_black' },
      { text: '掘金', link: 'https://juejin.im/user/5dcf5efb518825109e6b9eeb/posts', target: '_blank' },
      { text: 'GitHub', link: 'https://github.com/1446445040', target: '_blank' }
    ],
    categories
  }
}