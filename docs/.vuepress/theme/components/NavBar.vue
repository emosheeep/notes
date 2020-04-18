<template>
  <nav class="nav-container">
    <router-link to="/" class="page-title">
      <span>绝</span>
      <span>不</span>
      <span>熬</span>
      <span>夜</span>
    </router-link>
    <ul class="nav-list">
      <li><router-link to="/" :class="{active: $route.path === '/'}">首页</router-link></li>
      <li v-for="(item, index) in nav">
        <a
          :href="item.link"
          :target="item.target"
          :class="{active: $route.path.startsWith('/tags')}"
        >
          {{ item.text }}
        </a>
      </li>
      <li>
        <router-link
          to="/friends"
          :class="{active: $route.path.startsWith('/friends')}"
        >
          朋友圈
        </router-link>
      </li>
      <li>
        <router-link
          to="/about"
          :class="{active: $route.path.startsWith('/about')}"
        >
          关于
        </router-link>
      </li>
    </ul>
    <SearchBox />
  </nav>
</template>

<script>
import SearchBox from '@SearchBox'

export default {
  name: 'NavBar',
  components: { SearchBox },
  data () {
    return {
      nav: []
    }
  },
  mounted () {
    this.nav = this.$themeConfig.nav
    console.log(this)
  }
}
</script>

<style scoped lang="stylus">
  /*
   * 通用样式
   */
  $height = 60px
  highlight()
    color white !important
    background-color $accentColor

  /**
   * 主要样式
   */
  .active
    highlight()

  // 导航栏
  .nav-container
    height $height
    line-height $height
    box-shadow 0 1px 3px lightgrey
    background-color white

  // 文字logo
  .page-title
    padding-left 30px
    font-size 20px
    text-align center
    color black
    span
      $radius = 30px
      display inline-block
      height $radius
      width $radius
      line-height $radius
      border-radius $radius
      border 1px solid black

  // 导航列表
  .nav-list
    display inline-grid
    grid-template-columns repeat(4, 1fr)
    width 400px
    float right
    margin 0
    text-align center
    list-style none
    a
      display inline-block
      width 100%
      height $height
      line-height $height
      color black
      text-decoration none
      box-sizing border-box
      transition all .1s ease
      &:hover
        highlight()

  @media only screen and (max-width: 700px)
    .nav-list
      padding 0
      width 100%
    .page-title
      display none
</style>
