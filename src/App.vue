<template>
  <div id="app">
    <WelcomePage v-if="activePage == 'welcome'"/>
  </div>
</template>

<script>
//import Component from './components/Component.vue'
import WelcomePage from './pages/WelcomePage.vue';

export default {
  name: 'App',
  data() {
    return {
      activePage: "welcome"
    }
  },
  components: {
    WelcomePage
  },
  methods: {
    
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
