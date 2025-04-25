<template>
    <div class="property-manager">
      <h2 class="title">Spot manager</h2>
  
      <!-- Spot Info Section -->
      <div class="property-card">
        <div class="row">
          <div>
            <label>Name</label>
            <span v-if="!editing.name">{{ spot.name }}</span>
            <input v-else v-model="editableSpot.name" />
            <button @click="toggleEdit('name')" />
          </div>
  
          <div class="price-block">
            <label>Price/night</label>
            <span v-if="!editing.price">{{ spot.base_price }} €</span>
            <input v-else type="number" v-model.number="editableSpot.base_price" />
            <button @click="toggleEdit('price')" />
          </div>
        </div>
  
        <!-- Picture Section -->
        <div class="picture-block">
          <div class="picture-placeholder">Picture(s)</div>
          <!-- Later you can make this editable or a gallery upload -->
        </div>
  
        <!-- Description -->
        <div class="row">
          <label>Description</label>
          <span v-if="!editing.description">{{ spot.description }}</span>
          <textarea v-else v-model="editableSpot.description" rows="3" />
          <button @click="toggleEdit('description')" />
        </div>
  
        <!-- Amenities -->
        <div class="row">
          <label>Amenities</label>
          <ul v-if="!editing.amenities">
            <li v-for="(a, i) in spot.amenities" :key="i">{{ a }}</li>
          </ul>
          <div v-else class="amenity-edit">
            <label v-for="amenity in allAmenities" :key="amenity.id">
              <input
                type="checkbox"
                :value="amenity.name"
                v-model="editableSpot.amenities"
              />
              {{ amenity.name }}
            </label>
          </div>
          <button @click="toggleEdit('amenities')" />
        </div>
  
        <!-- Bookings Info -->
        <div class="row">
          <label>Bookings</label>
          <ul>
            <li v-for="booking in spot.booking" :key="booking.booking_id">
              {{ formatDate(booking.start_date) }} – {{ formatDate(booking.end_date) }}
            </li>
          </ul>
        </div>
  
        <!-- Delete Button -->
        <div class="footer">
          <button class="delete-button" @click="deleteSpot">Delete spot</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  
  export default {
    name: 'ManageProperty',
    props: {
      spot: Object
    },
    data() {
      return {
        editableSpot: { ...this.spot },
        editing: {
          name: false,
          price: false,
          description: false,
          amenities: false
        },
        allAmenities: []
      };
    },
    mounted() {
    if (this.spot) {
        this.editableSpot = { ...this.spot };
    }

    this.fetchAmenities();
    },
    methods: {
      toggleEdit(field) {
        this.editing[field] = !this.editing[field];
      },
      async fetchAmenities() {
        try {
        const res = await fetch('http://localhost:3000/amenitie');
        const data = await res.json();
        this.allAmenities = data.map(a => ({
            id: a.amenitie_id,
            name: a.name
        }));
        } catch (err) {
        console.error('Error fetching amenities:', err);
        }
    },
      deleteSpot() {
        // call API to delete
        if (confirm('Are you sure you want to delete this spot?')) {
          fetch(`http://localhost:3000/spot/${this.spot.spot_id}`, {
            method: 'DELETE'
          }).then(() => {
            this.$emit('changePage', 'profile'); // or back to profile
          });
        }
        
      },
      formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString();
      },
      handleSpotDeleted() {
        this.refreshUser();
        this.setActivePage('profile');
      }
    }
  };
  </script>
  
  <style scoped>
  .property-manager {
    padding: 2rem;
    background: #f8f8f8;
  }
  
  .title {
    color: #999;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .property-card {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 6px rgba(0,0,0,0.1);
  }
  
  .row {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .row label {
    font-weight: bold;
    width: 100px;
  }
  
  input, textarea {
    flex: 1;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  
  .picture-block {
    margin: 1rem 0;
    text-align: center;
  }
  
  .picture-placeholder {
    height: 150px;
    background: #ddd;
    border: 1px solid #ccc;
    line-height: 150px;
    font-weight: bold;
    color: #555;
  }
  
  .amenity-edit {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .delete-button {
    background-color: #176a02;
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 1rem;
  }
  
  .price-block {
    margin-left: auto;
  }

  button {
    margin-left: 1rem;
    background-color: #176a02;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  </style>
  