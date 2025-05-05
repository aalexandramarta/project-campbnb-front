<template>
  <div id="app">
    <div v-if="activePage === 'welcome'">
      <WelcomePage @changePage="setActivePage" />
    </div>
    <div v-if="activePage === 'login'">
      <LoginPage @changePage="setActivePage" @loginSuccess="setCurrentUser"/>
    </div>
    <div v-if="activePage === 'signup'">
      <SignupPage @changePage="setActivePage" @loginSuccess="setCurrentUser"/>
    </div>
    <div v-if="activePage === 'home'">
      <HomePage @changePage="setActivePage" />
    </div>
    <div v-if="activePage === 'spotDetail'">
      <SpotDetail :spot="selectedSpot" @changePage="setActivePage" @refreshUser="refreshUser"/>
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
    <div v-if="activePage === 'manageBooking'">
      <ManageBooking :booking="selectedBooking" @changePage="setActivePage" @refreshUser="refreshUser"/>
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
import ManageBooking from './pages/ManageBooking.vue';


export default {
  name: 'App',
  data() {
    return {
      activePage: "welcome",
      selectedSpot: null,
      currentUser: null,
      selectedBooking: null
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
    AddProperty,
    ManageBooking
  },
  created() {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  },
  methods: {
    setActivePage(page, data = null) {
      if (page === 'profile') {
        this.refreshUser();
      }
      this.activePage = page;
      if ((page === 'spotDetail' || page === 'propertyDetail') && data) {
        this.selectedSpot = data;
      } else if (page === 'manageBooking') {
        this.selectedBooking = data;
        this.refreshUser();
      }
    },
    async refreshUser() {
      // Fetch current user info if needed
      this.fetchCurrentUser(); 
      // ALSO fetch properties
      this.fetchUserProperties();
      },
    fetchUserProperties() {
      // API call to your backend to get properties owned by the user
      fetch('http://localhost:3000/spot')
      .then(response => response.json())
      .then(data => {
        this.userProperties = data.filter(spot => spot.user_id === this.currentUser.user_id);
      });
    },
    fetchCurrentUser() {
      if (!this.currentUser) return;

      fetch(`http://localhost:3000/user/${this.currentUser.user_id}`)
        .then(response => response.json())
        .then(data => {
          this.currentUser = data;
          localStorage.setItem('user', JSON.stringify(data)); // Update local storage too!
        })
        .catch(error => {
          console.error('Failed to refresh current user', error);
        });
    },
    setCurrentUser(user) {
      localStorage.setItem("user", JSON.stringify(user));
      this.currentUser = user;
    },
    handleSpotDeleted() {
      console.log('Spot deleted, refreshing user info...');
      this.refreshUser();
      this.setActivePage('profile');
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
