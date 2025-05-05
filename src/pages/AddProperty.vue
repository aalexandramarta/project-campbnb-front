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

          <!-- New-amenity input -->
          <div class="new-amenity">
            <input
              v-model="newAmenityName"
              placeholder="Add new amenity"
            />
            <button type="button" @click="addAmenity">➕ Add</button>
          </div>


          <!-- Add pictures -->
          <label>Upload Picture:</label>
          <input type="file" @change="handleFilesUpload" accept="image/*" multiple />

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
          created: new Date().toISOString(),
         
        },
        countryName: '',
        cityName: '',
        allAmenities: [],
        selectedAmenities: [],
        selectedPictures: [],
        newAmenityName: ''
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
      async addAmenity() {
        const name = this.newAmenityName.trim();
        if (!name) return alert('Please enter a name for the new amenity.');

        try {
          const res = await fetch('http://localhost:3000/amenitie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
          });
          const created = await res.json();
          // Add to list and select it
          this.allAmenities.push({
            id: created.amenitie_id,
            name: created.name
          });
          this.selectedAmenities.push(created.amenitie_id);
          this.newAmenityName = '';
        } catch (err) {
          console.error('Error creating amenity:', err);
          alert('Could not add amenity.');
        }
      },
      async getOrCreateLocation() {
        // Get or create the country
        const countryRes = await fetch('http://localhost:3000/country', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: this.countryName })
        });
        const country = await countryRes.json();

        // Get or create the city
        const cityRes = await fetch('http://localhost:3000/city', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            name: this.cityName,
            country_id: country.country_id
            })
        });
        const city = await cityRes.json();

        // Set IDs on the spot object
        this.spot.country_id = country.country_id;
        this.spot.city_id = city.city_id;
      },
      handleFilesUpload(event) {
        this.selectedPictures = Array.from(event.target.files); // Multiple files
      },
      async uploadPictures(spotId) {
        if (!this.selectedPictures.length) return; // No files selected

        const formData = new FormData();
        formData.append('spot_id', spotId);

        this.selectedPictures.forEach((file) => {
          formData.append('pictures', file); 
        });

        await fetch('http://localhost:3000/spot/pictures', {
          method: 'POST',
          body: formData
        });
      },
      async submitSpot() {
        try {
          console.log('Current user in submit:', this.currentUser);
          await this.getOrCreateLocation(); // check if country_id and city_id are set
          this.spot.user_id = this.currentUser?.user_id;

          // Clean spot data
          const spotPayload = {
            user_id: this.spot.user_id,
            country_id: this.spot.country_id,
            city_id: this.spot.city_id,
            name: this.spot.name,
            location: this.spot.location,
            description: this.spot.description,
            base_price: this.spot.base_price,
            created: this.spot.created,
            latitude: this.spot.latitude !== null ? this.spot.latitude : undefined,
            longitude: this.spot.longitude !== null ? this.spot.longitude : undefined,
            amenities_spots: {
              create: this.selectedAmenities.map(id => ({
                amenitie_id: id
              }))
            }
          };

          const res = await fetch('http://localhost:3000/spot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spotPayload)
          });

          const createdSpot = await res.json();

          await this.uploadPictures(createdSpot.spot_id);

          alert('Property created!');
          this.spot = {
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
          };
          this.countryName = '';
          this.cityName = '';
          this.selectedAmenities = [];
          this.selectedPictures = [];
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
  .new-amenity {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .new-amenity input {
    flex: 1;
  }
  .new-amenity button {
    padding: 0.4rem 0.8rem;
  }
  </style>
  