<template>
  <div id="vcomments" />
</template>

<script>
export default {
  name: 'MessageBox',
  mounted () {
    import(
      /* webpackChunkName: 'Valine' */
      'valine'
    ).then(({ default: Valine }) => {
      // eslint-disable-next-line no-new,no-undef
      new Valine({
        el: '#vcomments',
        appId: '2qJAldnFouTSw9I36vfaQVFV-gzGzoHsz',
        appKey: 'N333N5NmrdALyAFsdtQ7g3XN',
        avatar: 'retro',
        placeholder: '填写邮箱可以收到回复哦~',
        recordIP: true, // 记录ip
        path: location.pathname
      })
    })
  }
}
</script>

<style scoped lang="stylus">
  #vcomments
    margin-top 20px
    padding 20px
    background-color white
</style>
