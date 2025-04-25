<template>
    <div class="profile-page" v-if="user">
      <LogoHeader></LogoHeader>
      <h2 class="page-heading">My Profile</h2>
      <div class="profile-header">
        <p>
          <strong>Name:</strong>
          <span v-if="!isEditing">{{ user.name }}</span>
          <input v-else v-model="editedUser.name" />
          <button @click="toggleEdit">✏️</button>
        </p>

        <p>
          <strong>Email:</strong>
          <span v-if="!isEditing">{{ user.email }}</span>
          <input v-else v-model="editedUser.email" />
          <button @click="toggleEdit">✏️</button>
        </p>

        <p>
          <strong>Password:</strong>
          <span v-if="!isEditing">********</span>
          <input v-else type="password" v-model="editedUser.password" />
          <button @click="toggleEdit">✏️</button>
        </p>
      </div>
      <!-- Save / Cancel buttons -->
      <div v-if="isEditing">
        <button class="action-button" @click="saveChanges">Save</button>
        <button class="logout-button" @click="cancelEdit">Cancel</button>
      </div>

      <div class="section">
        <h3>Favorites</h3>
        <div v-if="user.favorites.length" class="spot-cards">
          <SpotCard
            v-for="favorite in user.favorites"
            :key="favorite.camping_spot.spot_id"
            :spot="favorite.camping_spot"
            @spotClicked="goToSpotDetail"
          />
        </div>
        <p v-else>No favorites yet.</p>
      </div>
  
      <div class="section">
        <h3>My Bookings</h3>
        <ul v-if="user.booking.length">
          <li v-for="booking in user.booking" :key="booking.booking_id" class="booking-item">
            {{ booking.camping_spot.name }} from {{ formatDate(booking.start_date) }} to {{ formatDate(booking.end_date) }}
            <button @click="manageBooking(booking)" class="manage-button">Manage My Booking</button>
          </li>
        </ul>
        <p v-else>No bookings yet.</p>
      </div>
  
      <div class="section">
        <h3>My Properties</h3>
        <ul v-if="user.camping_spot.length">
          <li v-for="spot in user.camping_spot" :key="spot.spot_id">
            {{ spot.name }} — {{ spot.location }}
            <button @click="manageProperty(spot)" class="manage-button">Manage My Property</button>
          </li>
        </ul>
        <p v-else>You haven't added any properties.</p>
        <button class="action-button" @click="addNewProperty">Add New Property</button>
      </div>
  
      <button class="logout-button" @click="logout">Logout</button>
      <button class="delete-button" @click="deleteAccount">Delete account</button>
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
        isEditing: false,
        editedUser: {}
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
      },
      async deleteAccount() {
        try {
          await fetch(`http://localhost:3000/user/${this.user.user_id}`, {
            method: 'DELETE'
          });
          localStorage.removeItem("user");
          this.$emit('changePage', 'welcome');
        } catch (err) {
          console.error("Error deleting user:", err);
        }
      },
      toggleEdit() {
        this.isEditing = true;
        this.editedUser = { ...this.user };
      },
      cancelEdit() {
        this.isEditing = false;
      },
      async saveChanges() {
        try {
          const res = await fetch(`http://localhost:3000/user/${this.user.user_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.editedUser)
          });
          const updatedUser = await res.json();
          this.user = updatedUser;
          localStorage.setItem("user", JSON.stringify(updatedUser));
          this.isEditing = false;
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      },
      manageBooking(booking) {
        console.log('Manage booking clicked:', booking);
        this.$emit('changePage', 'bookingDetail', booking);
      },
      manageProperty(spot) {
        console.log('Manage property clicked:', spot);
        this.$emit('changePage', 'propertyDetail', spot);
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
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0 auto;
  }
  .profile-header {
    display: flex;
    flex-direction: column; /* stacks items vertically */
    align-items: flex-start; /* aligns to the left */
    gap: 0.5rem;
  }

  input {
    margin-left: 0.5rem;
    padding: 0.25rem;
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
  .delete-button {
    margin-top: 1rem;
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .manage-button {
    margin-left: 1rem;
    background-color: #176a02;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .booking-item{
    margin-bottom: 0.8rem;
  }

  </style>
  