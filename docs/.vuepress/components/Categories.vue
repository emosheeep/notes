<template>
  <div>
    <ul>
      <li v-for="(nav, index) in categories" :key="index">
        {{ nav.title }}
        <ul>
          <li v-for="(name, idx) in nav.items" :key="idx">
            <router-link :to="`/${nav.title}/${name}`">
              {{ name }}
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
    <message-box style="padding: 20px 0"/>
  </div>
</template>

<script>
export default {
  computed: {
    categories () {
      return this.$themeConfig.categories
    }
  }
}
</script>