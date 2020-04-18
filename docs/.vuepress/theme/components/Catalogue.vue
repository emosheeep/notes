<template>
  <nav class="container">
    <p class="title">目录</p>
    <ul class="catalogue">
      <li
        v-for="(h, index) in headers"
        :key="index"
        :class="[h.className, {active: curHeader === index}]"
        ref="cataItems"
      >
        <a
          :href="`#${h.id}`"
          @click="curHeader = index"
        >{{ h.content }}</a>
      </li>
    </ul>
  </nav>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'Catalog',
  props: {
    selector: {
      type: [String, Object],
      default: null
    }
  },
  data () {
    return {
      headers: [],
      curHeader: 0
    }
  },
  mounted () {
    this.analyze()
    this.bindScroll()
  },
  methods: {
    // 映射标题的结构
    analyze () {
      const { headers } = this.$page
      headers.forEach(h => {
        this.headers.push({
          id: h.slug,
          className: `title-${h.level}`,
          content: h.title
        })
      })
    },
    bindScroll () {
      const headers = document.querySelector(this.selector).querySelectorAll('h1, h2, h3')
      const handler = _.throttle((event) => {
        Array.from(headers).forEach((header, index) => {
          const { top } = header.getBoundingClientRect()
          if (top < 70 && top > 0) {
            this.curHeader = index
          }
        })
      }, 20)
      window.addEventListener('scroll', handler)
      this.$on('hook:beforeDestroyed', () => {
        window.removeEventListener('scroll', handler)
      })
    }
  }
}
</script>

<style scoped lang="stylus">
  $grey = #EBEDEF
  $blue = #34A0EF

  // 通用样式
  a, a:visited {
    color: black;
    background-color: inherit;
    text-decoration: none;
  }

  .container
    position sticky
    top 0
    padding 0
    margin 0
    list-style none
    li:hover
      background-color $grey
      &>a
        color $blue

  .title
    margin 20px 20px 5px 15px

  .catalogue
    position relative
    padding 0 10px
    margin 0
    width 200px
    font-size 14px
    list-style none
    &::before
      content ""
      position absolute
      left 17px
      width 3px
      height 100%
      background-color $grey
    a
      display block
      position relative
      padding 8px 20px
      white-space nowrap
      overflow hidden
      text-overflow ellipsis
    // 激活样式
    .active
      background-color $grey
      &>a
        color $blue
    /**
     * 分别对应三级标题的样式
     */
    // 标题前面的小圆点
    point($scale)
      content ""
      position absolute
      left 5px
      top 50%
      transform translateY(-50%)
      background-color black
      width $scale
      height $scale
      border-radius $scale
    .title-1
      font-weight bold
      &>a::before
        point(6px)
    .title-2
      padding-left 20px
      &>a::before
        point(5px)
    .title-3
      padding-left 40px
      &>a::before
        point(4px)
</style>
