<template>
  <div id="app">
    <div v-if="activePage === 'welcome'">
      <WelcomePage @changePage="setActivePage" />
    </div>
    <div v-if="activePage === 'login'">
      <LoginPage @changePage="setActivePage" />
    </div>
    <div v-if="activePage === 'signup'">
      <SignupPage @changePage="setActivePage" />
    </div>
    <div v-if="activePage === 'home'">
      <HomePage @changePage="setActivePage" />
    </div>
  </div>
</template>

<script>
//import Component from './components/Component.vue'
import WelcomePage from './pages/WelcomePage.vue';
import LoginPage from './pages/LoginPage.vue';
import SignupPage from './pages/SignupPage.vue';
import HomePage from './pages/HomePage.vue'

export default {
  name: 'App',
  data() {
    return {
      activePage: "welcome"
    }
  },
  components: {
    WelcomePage,
    LoginPage,
    SignupPage,
    HomePage
  },
  methods: {
    setActivePage(page) {
      this.activePage = page;
    }
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
