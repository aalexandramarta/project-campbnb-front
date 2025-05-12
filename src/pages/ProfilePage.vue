<template>
  <div class="profile-page" v-if="user">
    <LogoHeader />
    <div class="profile-container">
      <h2 class="page-heading">My Profile</h2>
      <div class="profile-header">
        <div class="field-group">
          <label>Name:</label>
          <div v-if="!isEditing">{{ user.name }}</div>
          <input v-else v-model="editedUser.name" class="field-input" />
          <button @click="toggleEdit" class="edit-btn" v-if="!isEditing">Edit</button>
        </div>

        <div class="field-group">
          <label>Email:</label>
          <div v-if="!isEditing">{{ user.email }}</div>
          <input v-else v-model="editedUser.email" class="field-input" />
          <button @click="toggleEdit" class="edit-btn" v-if="!isEditing">Edit</button>
        </div>

        <div class="field-group">
          <label>Password:</label>
          <div v-if="!isEditing">••••••••</div>
          <input v-else type="password" v-model="editedUser.password" class="field-input" />
          <button @click="toggleEdit" class="edit-btn" v-if="!isEditing">Edit</button>
        </div>

        <div class="action-row" v-if="isEditing">
          <button class="save-btn" @click="saveChanges">Save</button>
          <button class="cancel-btn" @click="cancelEdit">Cancel</button>
        </div>
      </div>

      <section class="section">
        <h3>Favorites</h3>
        <div class="spot-cards">
          <SpotCard
            v-for="fav in user.favorites"
            :key="fav.camping_spot.spot_id"
            :spot="fav.camping_spot"
            @spotClicked="goToSpotDetail"
          />
        </div>
        <p v-if="!user.favorites.length" class="empty-text">No favorites yet.</p>
      </section>

      <section class="section bookings-section">
        <h3>My Bookings</h3>
        <ul v-if="user.booking.length" class="booking-list">
          <li v-for="booking in user.booking" :key="booking.booking_id" class="booking-item">
            <div class="booking-info">
              <strong>{{ booking.camping_spot?.name || 'Unknown Spot' }}</strong>
              <span>{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</span>
            </div>
            <button class="manage-btn" @click="manageBooking(booking)">Manage</button>
          </li>
        </ul>
        <p v-else class="empty-text">No bookings yet.</p>
      </section>

      <section class="section properties-section">
        <h3>My Properties</h3>
        <ul v-if="userSpots.length" class="properties-list">
          <li v-for="spot in userSpots" :key="spot.spot_id" class="property-item">
            <div>{{ spot.name }} — {{ spot.location }}</div>
            <button class="manage-btn" @click="manageProperty(spot)">Manage</button>
          </li>
        </ul>
        <p v-else class="empty-text">You haven't added any properties.</p>
        <button class="add-btn" @click="addNewProperty">Add New Property</button>
      </section>

      <div class="footer-buttons">
        <button class="logout-btn" @click="logout">Logout</button>
        <button class="delete-btn" @click="deleteAccount">Delete Account</button>
      </div>

      <GoBackBtn @goBack="goBack" />
    </div>
  </div>

  <div v-else class="loading">Loading...</div>
</template>

<script>
import SpotCard from "@/components/SpotCard.vue";
import GoBackBtn from "@/components/GoBackBtn.vue";
import LogoHeader from "@/components/LogoHeader.vue";

export default {
  name: "ProfilePage",
  components: { SpotCard, GoBackBtn, LogoHeader },
  data() {
    return {
      user: null,
      userSpots: [],
      isEditing: false,
      editedUser: {}
    };
  },
  methods: {
    async refreshUserData() {
      const stored = localStorage.getItem('user');
      if (stored) this.user = JSON.parse(stored);
      // fetch fresh data
      try {
        const res = await fetch(`http://localhost:3000/user/${this.user.user_id}`);
        if (res.ok) {
          const data = await res.json();
          this.user = data;
          localStorage.setItem('user', JSON.stringify(data));
          this.userSpots = data.camping_spot;
        }
      } catch (e) {
        console.error(e);
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
        if (res.ok) await this.refreshUserData();
        this.isEditing = false;
      } catch (e) { console.error(e); }
    },
    formatDate(d) {
      return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    },
    goToSpotDetail(s) { this.$emit('changePage','spotDetail',s); },
    manageBooking(b) { this.$emit('changePage','manageBooking',b); },
    manageProperty(s) { this.$emit('changePage','propertyDetail',s); },
    addNewProperty() { this.$emit('changePage','addProperty'); },
    logout() {
      localStorage.removeItem('user');
      this.$emit('changePage','welcome');
    },
    async deleteAccount() {
      if (!confirm('Delete your account?')) return;
      await fetch(`http://localhost:3000/user/${this.user.user_id}`, { method:'DELETE' });
      localStorage.removeItem('user');
      this.$emit('changePage','welcome');
    },
    goBack() { this.$emit('changePage','home'); }
  },
  mounted() {
    this.refreshUserData();
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
.page-heading {
  text-align: center;
  margin-bottom: 1.5rem;
}
.profile-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
}
.field-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.field-input {
  flex: 1;
  padding: 0.4rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
.edit-btn {
  background: #10b981;
  color: #fff;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.save-btn { background: #2563eb; color: #fff; border:none; padding:0.4rem 1rem; border-radius:4px; cursor:pointer; }
.cancel-btn { background: #f3f4f6; color:#374151; border:none; padding:0.4rem 1rem; border-radius:4px; cursor:pointer; }
.section { margin-top: 2rem; }
.spot-cards { display: flex; flex-wrap: wrap; gap: 1rem; }
.bookings-section .booking-list,
.properties-section .properties-list { display: flex; flex-direction: column; gap: 1rem; }
.booking-item, .property-item { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.manage-btn { background: #176a02; color:#fff; border:none; padding:0.4rem 0.8rem; border-radius:4px; cursor:pointer; }
.add-btn { background: #2563eb; color:#fff; border:none; padding:0.6rem 1.2rem; border-radius:6px; cursor:pointer; margin-top:1rem; }
.footer-buttons { display: flex; justify-content: center; gap: 1rem; margin: 2rem 0; }
.logout-btn, .delete-btn { padding: 0.6rem 1.2rem; border-radius: 6px; border: none; cursor: pointer; }
.logout-btn { background: #ef4444; color: #fff; }
.delete-btn { background: #9ca3af; color: #fff; }
.empty-text { color: #6b7280; font-style: italic; }
.loading { text-align: center; padding: 2rem; }
</style>
