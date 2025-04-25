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
    <div v-if="activePage === 'propertyDetail'">
      <ManageProperty :spot="selectedSpot" @changePage="(page, spot) => setActivePage(page, spot)" @spotDeleted="handleSpotDeleted" />
    </div>
    <div v-if="activePage === 'addProperty'">
      <AddProperty  :currentUser="currentUser" @propertyAdded="refreshUser" @changePage="(page) => setActivePage(page)" />
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
import ManageProperty from './pages/ManageProperty.vue';
import AddProperty from './pages/AddProperty.vue';


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
    ProfilePage,
    ManageProperty,
    AddProperty
  },
  methods: {
    setActivePage(page, spot = null) {
      this.activePage = page;
      if (page === 'spotDetail' || page === 'propertyDetail'  && spot) {
        this.selectedSpot = spot; // Store the spot data for the spot detail page
      }
    },
    async refreshUser() {
      if (!this.currentUser?.user_id) return;
      try {
        const res = await fetch(`http://localhost:3000/user/${this.currentUser.user_id}`);
        this.currentUser = await res.json();
      } catch (err) {
        console.error("Failed to refresh user data", err);
      }
    },
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
