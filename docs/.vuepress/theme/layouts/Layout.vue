<template>
  <div class="theme-container">
    <div class="content-box">
      <!--文章区域-->
      <Content id="article"/>
      
      <!--文章下方的详细信息-->
      <div class="article-footer">
        <span>{{ $themeConfig.lastUpdated  }}</span>
        <time>{{ $page.lastUpdated }}</time>
      </div>

      <!--评论区-->
      <message-box />
    </div>

    <!--目录区域-->
    <catalogue selector="#article" class="list" :async-data="false" />
  </div>
</template>

<script>
import Catalogue from '@theme/components/Catalogue.vue'
export default {
  components: { Catalogue },
  mounted () {
    console.log(this)
  }
}
</script>

<style scoped lang="stylus">
  .theme-container
    display flex
    align-items flex-start
    width min-content
    margin 0 auto
  .content-box
    width 720px
    margin 0 auto
  .article-footer
    padding 0 30px 20px 30px
    color grey
    text-align right
    background white

  /**
    * 控制目录的显示和隐藏
    */
  @media only screen and (max-width: 950px)
    .list
      display none
    .theme-container
      width 100%
    .content-box
      width 100%
</style>

<style scoped lang="stylus">
  #article >>> &
    width 100%
    margin 0 auto
    padding 30px
    font-size 16px
    background-color white
    box-sizing border-box
    h1, h2
      margin 20px 0
    ol
      padding-left 30px
      margin 10px 0
    ul
      list-style unset // 抵消全局样式
    img
      width 100%
      max-height 250px
      object-fit contain
    a, a:visited {
      color: #4183C4;
      background-color: inherit;
      text-decoration: none;
    }
    a:hover
      text-decoration underline
    p
      margin 15px 0
    blockquote
      padding 15px
      margin 10px 0
      border-left 5px solid #42B983
      background-color #F5F2F0
    pre
      overflow auto
      padding 10px
      background-color #F5F2F0
      border-radius 5px
      scroll()
      code
        margin 0
        padding 0
        line-height 1.5em
        background-color #F5F2F0
        font-family Consolas,Monaco,Andale,Mono,Ubuntu,Mono,monospace
    code
      padding 0 5px
      margin 0 5px
      line-height 1.5em
      background-color rgb(243,243,243)
      font-family Consolas,Monaco,Andale,Mono,Ubuntu,Mono,monospace
</style>