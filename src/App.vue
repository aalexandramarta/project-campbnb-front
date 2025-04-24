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
    <div v-if="activePage === 'spotDetail'">
      <SpotDetail :spot="selectedSpot" @changePage="setActivePage" />
    </div>
    <div v-if="activePage === 'profile'">
      <ProfilePage @changePage="(page, spot) => setActivePage(page, spot)" />
    </div>
    
  </div>
</template>

<script>
//import Component from './components/Component.vue'
import WelcomePage from './pages/WelcomePage.vue';
import LoginPage from './pages/LoginPage.vue';
import SignupPage from './pages/SignupPage.vue';
import HomePage from './pages/HomePage.vue'
import SpotDetail from './pages/SpotDetail.vue'; 
import ProfilePage from './pages/ProfilePage.vue';


export default {
  name: 'App',
  data() {
    return {
      activePage: "welcome",
      selectedSpot: null
    }
  },
  components: {
    WelcomePage,
    LoginPage,
    SignupPage,
    HomePage,
    SpotDetail,
    ProfilePage
  },
  methods: {
    setActivePage(page, spot = null) {
      this.activePage = page;
      if (page === 'spotDetail' && spot) {
        this.selectedSpot = spot; // Store the spot data for the spot detail page
      }
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
