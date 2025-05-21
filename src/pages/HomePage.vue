<template>
    <div class="main-page">
      <LogoHeader></LogoHeader>
      <button class="profile-icon-btn" @click="goToProfile">
        <img src="@/assets/profile-icon.png" alt="My Profile" class="profile-icon" />
      </button>
      <!-- <h2 class="page-heading">Home page</h2> -->
      <p v-if="currentUser" class="page-heading">Welcome, {{ currentUser.name }}!</p>
  
      <div class="filters-section">
          <div class="location-search filter-group autocomplete-wrapper">
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              @focus="onSearchInput"
              @blur="onBlur"
              type="text"
              placeholder="Where do you want to go?"
            />
            <ul v-if="showCityMenu" class="suggestions">
              <li
                v-for="city in filteredCities"
                :key="city"
                @mousedown.prevent="chooseCity(city)"
              >{{ city }}</li>
            </ul>
          </div>

        <div class="date-filter filter-group">
          <label for="checkIn">Check-in</label>
          <input id="checkIn" v-model="checkIn" type="date" class="filter-input" />
        </div>

        <div class="date-filter filter-group">
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
        dateError: false,
        citySuggestions: [],      // all unique city names
        filteredCities: [],       // suggestions matching what they’ve typed
        showCityMenu: false
      };
    },
    computed: {
      filteredSpots() {
        const q = this.searchQuery.trim().toLowerCase();
        return this.spots.filter(spot => {
          // match city OR country
          const cityName    = spot.city?.name?.toLowerCase()    || '';
          const countryName = spot.country?.name?.toLowerCase() || '';
          const matchesLocation = !q || cityName.includes(q) || countryName.includes(q);

          const matchesPrice = this.maxPrice
            ? spot.base_price <= this.maxPrice
            : true;

          const matchesAmenities = this.selectedAmenities.every(amenity => //if every callback is true it returns true
            spot.amenities.includes(amenity)
          );

          // date‐error flag
          if (this.checkIn && this.checkOut &&
              new Date(this.checkIn) >= new Date(this.checkOut)) {
            this.dateError = true;
          } else {
            this.dateError = false;
          }

          // booking conflict
          const hasDateConflict = () => {
            if (!this.checkIn || !this.checkOut) return false;
            const selStart = new Date(this.checkIn);
            const selEnd   = new Date(this.checkOut);
            return spot.booking.some(b => {
              const bStart = new Date(b.start_date);
              const bEnd   = new Date(b.end_date);
              return selStart < bEnd && selEnd > bStart;
            });
          };

          return matchesLocation &&
                matchesPrice &&
                matchesAmenities &&
                !hasDateConflict();
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

          const pairs = new Map()
          this.spots.forEach(s => {
            if (s.city?.name && s.country?.name) {
              const key = `${s.city.name}, ${s.country.name}`
              pairs.set(key, true)
            }
          })
          this.citySuggestions = Array.from(pairs.keys())

        } catch (error) {
          console.error('Error fetching spots or amenities:', error);
        }
      },
      toggleFilterPanel() {
        this.showFilters = !this.showFilters;
      },
      goToSpotDetail(spot) {
        console.log("Spot clicked:", spot);
        this.$emit('changePage', 'spotDetail', {
          spot,
          // pass what the user entered
          checkIn: this.checkIn || null,
          checkOut: this.checkOut || null
        });
      },
      goToProfile() {
        this.$emit('changePage', 'profile');
      },
      onSearchInput() {
        const q = this.searchQuery.toLowerCase().trim()
        if (!q) {
          this.filteredCities = []
          this.showCityMenu = false
          return
        }
        this.filteredCities = this.citySuggestions.filter(item =>
          item.toLowerCase().includes(q)
        )
        this.showCityMenu = this.filteredCities.length > 0
      },
      chooseCity(item) {
        this.searchQuery = item
        this.showCityMenu = false
      },
      onBlur() {
        // the global setTimeout
        window.setTimeout(() => {
          this.showCityMenu = false;
        }, 150);
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
.location-search {
  margin-right: 1rem;
}

.filters-section {
  display: flex;
  flex-wrap: nowrap; /* wrap only if the screen is too small */
  align-items: center;
  gap: 1rem;
  overflow-x: auto; /* scroll on smaller screens */
  padding-bottom: 0.5rem;
  align-items: flex-end;
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

.filter-group label {
  font-size: 0.9rem;
  color: #4B5563;
  margin-bottom: 0.3rem;
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
.profile-icon-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  /* optionally position it absolutely in a corner: */
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-block;    /* sits in flow below logo */
  margin-top: 2.5rem;  
}

.profile-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #176A02;
  transition: transform .1s ease-in-out;
}

.profile-icon-btn:hover .profile-icon {
  transform: scale(1.1);
}
.autocomplete-wrapper {
  position: relative;
  width: 250px;
}
.autocomplete-wrapper input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
}
.suggestions {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}
.suggestions li {
  padding: 0.4rem 0.6rem;
  cursor: pointer;
}
.suggestions li:hover {
  background: #f0f0f0;
}
  </style>
  