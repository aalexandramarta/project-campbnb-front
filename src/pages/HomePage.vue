<template>
    <div class="main-page">
      <LogoHeader></LogoHeader>
      <button @click="goToProfile" class="profile-button">My Profile</button>
      <h2 class="page-heading">Home page</h2>
      <p v-if="currentUser">Welcome, {{ currentUser.name }}!</p>
  
      <div class="filters-section">
        <input v-model="searchQuery" type="text" placeholder="Where do you want to go?" class="filter-input" />
        <div class="date-filter">
          <label for="checkIn">Check-in</label>
          <input id="checkIn" v-model="checkIn" type="date" class="filter-input" />
        </div>

        <div class="date-filter">
          <label for="checkOut">Check-out</label>
          <input id="checkOut" v-model="checkOut" type="date" class="filter-input" />
        </div>

        <button @click="toggleFilterPanel" class="filter-button">Advanced Filters</button>
      </div>

      <div v-if="showFilters" class="advanced-filters">
        <label>
          Max Price:
          <input type="number" v-model.number="maxPrice" class="filter-input" />
        </label>
        <div class="amenities">
          Amenities: 
          <label v-for="amenity in allAmenities" :key="amenity.id">
            <input type="checkbox" :value="amenity.name" v-model="selectedAmenities" />
            {{ amenity.name }}
          </label>
        </div>
        
      </div>
      <p v-if="dateError" class="error-message">Check-in date must be before check-out date.</p>
  
      <!-- <div class="map-view">Map view</div> -->
  
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
        maxPrice: null,
        selectedAmenities: [],
        allAmenities: [],
        showFilters: false,
        currentUser: null,
        dateError: false
      };
    },
    computed: {
      filteredSpots() {

        return this.spots.filter(spot => {
        const matchesCity =  !this.searchQuery || 
        (spot.city?.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false);
        const matchesPrice = this.maxPrice ? spot.base_price <= this.maxPrice : true;
        const matchesAmenities = this.selectedAmenities.every(amenity =>
          spot.amenities.includes(amenity)
        );
        if (this.checkIn && this.checkOut && new Date(this.checkIn) >= new Date(this.checkOut)) {
          this.dateError = true;

        } else {
          this.dateError = false;
        }
        // Only check booking conflicts if both dates are selected
        const hasDateConflict = () => {
          if (!this.checkIn || !this.checkOut) return false;

          const selectedStart = new Date(this.checkIn);
          const selectedEnd = new Date(this.checkOut);

          return spot.booking.some(booking => {
            const bookingStart = new Date(booking.start_date);
            const bookingEnd = new Date(booking.end_date);

            // Overlapping logic
            return selectedStart < bookingEnd && selectedEnd > bookingStart;
          });
        };

        return matchesCity && matchesPrice && matchesAmenities && !hasDateConflict();
        });
        
      }
    },
    methods: {
      async fetchAmenities() {
        try {
          const response = await fetch('http://localhost:3000/amenitie');
          const data = await response.json();
          this.allAmenities = data.map(amenity => ({
            id: amenity.amenitie_id,
            name: amenity.name
          }));
        } catch (error) {
          console.error('Error fetching amenities:', error);
        }
      },
      async fetchSpots() {
        try {
          const [spotsResponse, amenitiesResponse] = await Promise.all([
            fetch('http://localhost:3000/spot'),
            fetch('http://localhost:3000/amenitie')
          ]);

          const spotsData = await spotsResponse.json();
          const amenitiesData = await amenitiesResponse.json();

          // Map of amenitie_id => amenity name, extract the names
          const amenityMap = {};
          amenitiesData.forEach(amenity => {
            amenityMap[amenity.amenitie_id] = amenity.name;
          });

          // Attach amenity names to each spot
          this.spots = spotsData.map(spot => {
            const amenityNames = (spot.amenities_spots || [])
            .map(as => amenityMap[as.amenitie_id])
            .filter(Boolean);
            return {
              ...spot,
              amenities: amenityNames
            };
          });

          // Set all amenities from db for filtering
          this.allAmenities = amenitiesData.map(a => ({
            id: a.amenitie_id,
            name: a.name
          }));

        } catch (error) {
          console.error('Error fetching spots or amenities:', error);
        }
      },
      toggleFilterPanel() {
        this.showFilters = !this.showFilters;
      },
      goToSpotDetail(spot) {
        console.log("Spot clicked:", spot);
        this.$emit('changePage', 'spotDetail', spot);
      },
      goToProfile() {
        this.$emit('changePage', 'profile');
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
      this.fetchAmenities();

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
  justify-content: center;
  flex-wrap: wrap;
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

.advanced-filters {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.error-message {
  color: red;
  margin-top: -1rem;
  margin-bottom: 1rem;
}
.profile-button {
  background-color: #92A985;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}
  </style>
  