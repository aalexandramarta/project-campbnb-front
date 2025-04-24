<template>
    <div class="profile-page" v-if="user">
        <LogoHeader></LogoHeader> 
      <h2 class="page-heading">My Profile</h2>
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
  
      <div class="section">
        <h3>Favorites</h3>
        <div v-if="user.favorites.length" class="spot-cards">
          <SpotCard
            v-for="spot in user.favorites"
            :key="spot.spot_id"
            :spot="spot"
            @spotClicked="goToSpotDetail"
          />
        </div>
        <p v-else>No favorites yet.</p>
      </div>
  
      <div class="section">
        <h3>My Bookings</h3>
        <ul v-if="user.booking.length">
          <li v-for="booking in user.booking" :key="booking.booking_id">
            Spot {{ booking.booking_id }} — {{ formatDate(booking.start_date) }} to {{ formatDate(booking.end_date) }} | ${{ booking.price }}/night
          </li>
        </ul>
        <p v-else>No bookings yet.</p>
      </div>
  
      <div class="section">
        <h3>My Properties</h3>
        <ul v-if="user.camping_spot.length">
          <li v-for="spot in user.camping_spot" :key="spot.spot_id">
            {{ spot.name }} — {{ spot.location }}
          </li>
        </ul>
        <p v-else>You haven't added any properties.</p>
        <button class="action-button" @click="addNewProperty">Add New Property</button>
      </div>
  
      <button class="logout-button" @click="logout">Logout</button>
      <GoBackBtn @goBack="goBack" />
    </div>
    <div v-else>Loading...</div>
  </template>
  
  <script>
  import SpotCard from "@/components/SpotCard.vue";
  import GoBackBtn from '@/components/GoBackBtn.vue';
  import LogoHeader from '@/components/LogoHeader.vue';
  
  export default {
    name: "ProfilePage",
    components: { SpotCard, GoBackBtn, LogoHeader },
    data() {
      return {
        user: null,
        allSpots: [],
      };
    },
    computed: {
      favoriteSpots() {
        if (!this.user || !this.user.favorites) return [];
        return this.user.favorites.map(f => f.camping_spot);
      }
    },
    methods: {
      async fetchAllSpots() {
        try {
          const res = await fetch("http://localhost:3000/spot");
          const data = await res.json();
          this.allSpots = data;
        } catch (err) {
          console.error("Failed to fetch all spots:", err);
        }
      },
      formatDate(dateStr) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
      },
      goToSpotDetail(spot) {
        this.$emit('changePage', 'spotDetail', spot.camping_spot);
      },
      addNewProperty() {
        this.$emit('changePage', 'addProperty');
      },
      logout() {
        localStorage.removeItem("user");
        this.$emit('changePage', 'welcome');
      },
      goBack() {
        this.$emit('changePage', 'home');
      }
    },
    mounted() {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
      this.fetchAllSpots();
    }
  };
  </script>
  
  <style scoped>
  .profile-page {
    padding: 2rem;
    max-width: 900px;
    margin: auto;
  }
  .page-heading {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }
  .section {
    margin-top: 2rem;
  }
  .spot-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    margin-top: 1rem;
  }
  .action-button {
    margin-top: 1rem;
    background-color: #10b981;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .logout-button {
    margin-top: 3rem;
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
  }
  </style>
  