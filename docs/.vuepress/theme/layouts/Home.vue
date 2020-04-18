<template>
  <div class="container">
    <ParentLayout />
  </div>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue'
export default {
  components: { ParentLayout }
}
</script>

<style scoped lang="stylus">
  .container
    max-width $maxPageWidth
    margin 0 auto
    background white
</style>