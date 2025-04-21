<template>
    <div class="main-page">
      <LogoHeader></LogoHeader>
      <h2 class="page-heading">Home page</h2>
      <p v-if="currentUser">Welcome, {{ currentUser.name }}!</p>
  
      <div class="filters-section">
        <input v-model="searchQuery" type="text" placeholder="Where do you want to go?" class="filter-input" />
        <input v-model="checkIn" type="date" class="filter-input" />
        <input v-model="checkOut" type="date" class="filter-input" />
        <button @click="applyFilters" class="filter-button">Filter</button>
      </div>
  
      <div class="map-view">Map view</div>
  
      <div class="spot-cards">
        <SpotCard v-for="spot in filteredSpots" :key="spot.spot_id" :spot="spot" @spotClicked="goToSpotDetail"/>
      </div>
    </div>
  </template>
  
  <script>
  import SpotCard from '@/components/SpotCard.vue'; 
  import LogoHeader from '@/components/LogoHeader.vue';
  
  export default {
    name: 'HomePage',
    components: {
      SpotCard,
      LogoHeader
    },
    data() {
      return {
        spots: [],
        searchQuery: '',
        checkIn: '',
        checkOut: '',
        currentUser: null
      };
    },
    computed: {
      filteredSpots() {
        return this.spots.filter(spot =>
          spot.city.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    },
    methods: {
      async fetchSpots() {
        try {
          const response = await fetch('http://localhost:3000/spot');
          const data = await response.json();
          this.spots = data;
        } catch (error) {
          console.error('Error fetching spots:', error);
        }
      },
      applyFilters() {
        // In this version, filters are only applied by city name.
        // Add logic here if you want to use check-in/out dates for filtering later.
      },
      goToSpotDetail(spot) {
        console.log("Spot clicked:", spot);
        //this.$emit('changePage', 'spotDetail', spot);
      }
    },
    mounted() {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser); // store user object
            console.log("Logged-in user:", this.currentUser);
        } else {
            console.warn("No user found in localStorage.");
        }   
      this.fetchSpots();

    }
  };
  </script>
  
  <style scoped>
  .main-page {
  background: #fff;
  padding: 2rem;
}

.page-heading {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #6b7280;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-input {
  padding: 0.5rem;
  font-size: 1rem;
  width: 100%;
  max-width: 200px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.filter-button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  background-color: #176a02;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.map-view {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.spot-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
  </style>
  