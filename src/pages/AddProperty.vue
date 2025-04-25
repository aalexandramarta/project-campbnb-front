<template>
    <div class="add-property">
      <h2>Add New Property</h2>
  
      <form @submit.prevent="submitSpot">
        <label>Name:</label>
        <input v-model="spot.name" required />
  
        <label>Description:</label>
        <textarea v-model="spot.description" required></textarea>
  
        <label>Price per night (€):</label>
        <input type="number" v-model.number="spot.base_price" required />
  
        <label>Location:</label>
        <input v-model="spot.location" placeholder="Street, nr." required/>
  
        <!-- <label>Latitude:</label>
        <input v-model.number="spot.latitude" />
  
        <label>Longitude:</label>
        <input v-model.number="spot.longitude" /> -->
  
        <label>Country Name:</label>
        <input v-model="countryName" placeholder="e.g. Netherlands" required />

        <label>City Name:</label>
        <input v-model="cityName" placeholder="e.g. Amsterdam" required />

        <div class="amenities">
          <label>Amenities:</label>
          <div class="amenity-list">
            <label v-for="amenity in allAmenities" :key="amenity.id">
              <input
                type="checkbox"
                :value="amenity.id"
                v-model="selectedAmenities"
              />
              {{ amenity.name }}
            </label>
          </div>
        </div>
  
        <button type="submit">Create Property</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AddProperty',
    props: ['currentUser'],
    data() {
      return {
        spot: {
          name: '',
          description: '',
          base_price: null,
          location: '',
          latitude: null,
          longitude: null,
          country_id: null,
          city_id: null,
          user_id: this.currentUser?.user_id,
          created: new Date().toISOString()
        },
        countryName: '',
        cityName: '',
        allAmenities: [],
        selectedAmenities: []
      };
    },
    methods: {
      async fetchAmenities() {
        try {
          const res = await fetch('http://localhost:3000/amenitie');
          const data = await res.json();
          this.allAmenities = data.map(a => ({
            id: a.amenitie_id,
            name: a.name
          }));
        } catch (err) {
          console.error('Failed to fetch amenities:', err);
        }
      },
      async getOrCreateLocation() {
        // 1. Get or create the country
        const countryRes = await fetch('http://localhost:3000/country', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: this.countryName })
        });
        const country = await countryRes.json();

        // 2. Get or create the city
        const cityRes = await fetch('http://localhost:3000/city', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            name: this.cityName,
            country_id: country.country_id
            })
        });
        const city = await cityRes.json();

        // 3. Set IDs on the spot object
        this.spot.country_id = country.country_id;
        this.spot.city_id = city.city_id;
      },
      async submitSpot() {
        try {
            await this.getOrCreateLocation(); // ✅ get IDs based on names

            const res = await fetch('http://localhost:3000/spot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.spot)
            });

            const createdSpot = await res.json();

            // Optional: link amenities
            await Promise.all(
            this.selectedAmenities.map(amenityId =>
                fetch('http://localhost:3000/amenitie_spot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amenitie_id: amenityId,
                    spot_id: createdSpot.spot_id
                })
                })
            )
            );

            alert('Property created!');
            this.$emit('propertyAdded');
            this.$emit('changePage', 'profile');

        } catch (err) {
            console.error('Error creating spot:', err);
            alert('Something went wrong');
        }
          
      }
    },
    mounted() {
      this.fetchAmenities();
    }
  };
  </script>
  
  <style scoped>
  .add-property {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  input, textarea {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  
  .amenity-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  button {
    background-color: #176a02;
    color: white;
    padding: 0.6rem;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
  }
  </style>
  