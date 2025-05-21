<template>
  <div class="property-manager" v-if="editableSpot && spot">
    <h2 class="title">Spot Manager</h2>

    <div class="property-card">
      <!-- Spot Image Gallery -->
      <div class="spot-images" v-if="spot.pictures?.length">
        <div v-for="pic in spot.pictures" :key="pic.picture_id" class="gallery-item">
          <img :src="pic.url" class="spot-image" />
        </div>
      </div>
      <p v-else class="no-pics">No pictures available</p>

      <!-- Upload More Pictures -->
      <div class="upload-section">
        <label>Add Pictures:</label>
        <input type="file" accept="image/*" multiple @change="handlePictureSelection" />
        <button class="upload-btn" @click="uploadNewPictures" :disabled="!newPictures.length">Upload Pictures</button>
      </div>

      <!-- Editable Fields -->
      <div class="row">
        <label>Name</label>
        <input v-model="editableSpot.name" />
      </div>

      <div class="row">
        <label>Price/night</label>
        <input type="number" v-model.number="editableSpot.base_price" />
      </div>

      <div class="row">
        <label>Description</label>
        <textarea v-model="editableSpot.description" rows="3"></textarea>
      </div>

      <div class="row">
        <label>Amenities</label>
        <div class="amenity-edit">
          <label v-for="amen in allAmenities" :key="amen.id" class="amenity-checkbox">
            <input type="checkbox" :value="amen.name" v-model="editableSpot.amenities" />
            {{ amen.name }}
          </label>
        </div>
      </div>

      <!-- Add New Amenity -->
      <div class="new-amenity-row">
        <input v-model="newAmenityName" placeholder="Add a new amenity" />
        <button class="add-btn" @click="addAmenity"> + Add Amenity</button>
      </div>

      <!-- Bookings -->
      <div class="row">
        <label>Bookings</label>
        <ul class="booking-list" v-if="editableSpot.booking && editableSpot.booking.length" >
          <li v-for="booking in editableSpot.booking || []" :key="booking.booking_id">
            <span class="booker">
              <strong>{{ booking.user.name }}</strong>
              <em>({{ booking.user.email }})</em>
            </span>
            <span v-if="booking.status_id != null" class="status-badge" :class="'status-' + booking.status_id">
              {{ statusText(booking.status_id) }}
            </span>
            {{ formatDate(booking.start_date) }} – {{ formatDate(booking.end_date) }}
            <span v-if="booking.status_id === 1" class="action-buttons">
              <button @click="updateBookingStatus(booking.booking_id, 2)">Accept</button>
              <button @click="updateBookingStatus(booking.booking_id, 3)">Decline</button>
            </span>
          </li>
        </ul>
        <p v-else class="no-bookings">No bookings yet.</p>
      </div>

      <!-- Save All Button -->
      <div class="save-all-row">
        <button class="save-all-btn" @click="saveAllChanges">Save Changes</button>
      </div>

      <!-- Reviews Section -->
      <div class="reviews-section">
        <h3>Reviews</h3>
        <div v-if="spot.review && spot.review.length">
          <div 
            v-for="rev in spot.review" 
            :key="rev.review_id"
            class="review-item"
          >
            <p>
              <strong>{{ rev.user?.name || 'Guest' }}</strong>
              <span class="review-date">({{ formatDate(rev.created) }})</span>
            </p>
            <p>Rating: {{ rev.rating }} / 5</p>
            <p class="review-comment">“{{ rev.comment }}”</p>
          </div>
        </div>
        <p v-else class="no-reviews">No reviews yet.</p>
      </div>


      <!-- Delete Spot -->
      <div class="footer">
        <button class="delete-btn" @click="deleteSpot">Delete Spot</button>
      </div>
    </div>

    <GoBackBtn @goBack="goBack" />
  </div>
</template>

<script>
import GoBackBtn from '@/components/GoBackBtn.vue';

export default {
  name: 'ManageProperty',
  components: { GoBackBtn },
  props: ['spot'],
  data() {
    return {
      editableSpot: null,
      allAmenities: [],
      newAmenityName: '',
      newPictures: []
    };
  },
  async mounted() {
    await this.loadSpot();
    await this.fetchAmenities();
  },
  watch: {
   // if parent hands us a new spot ID, reload it
    spot() {
      this.loadSpot();
    }
  },
  methods: {
    async loadSpot() {
      if (!this.spot?.spot_id) return;
      try {
        const res  = await fetch(`http://localhost:3000/spot/${this.spot.spot_id}`);
        const full = await res.json();
        this.editableSpot = {
          ...full,
          amenities: (full.amenities_spots || [])
            .map(as => as.amenities?.name)
            .filter(Boolean)
        };
      } catch (err) {
        console.error('Failed to load spot:', err);
      }
    },
    async fetchAmenities() {
      const res = await fetch('http://localhost:3000/amenitie');
      const data = await res.json();
      this.allAmenities = data.map(a => ({ id: a.amenitie_id, name: a.name }));
    },
    async addAmenity() {
      const name = this.newAmenityName.trim();
      if (!name) return;
      const res = await fetch('http://localhost:3000/amenitie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const created = await res.json();
      this.allAmenities.push({ id: created.amenitie_id, name: created.name });
      this.editableSpot.amenities.push(created.name);
      this.newAmenityName = '';
    },
    handlePictureSelection(e) {
      this.newPictures = Array.from(e.target.files);
    },
    async uploadNewPictures() {
      if (!this.newPictures.length) return;
      const formData = new FormData();
      formData.append('spot_id', this.spot.spot_id);
      this.newPictures.forEach(f => formData.append('pictures', f));
      await fetch('http://localhost:3000/spot/pictures', { method: 'POST', body: formData });
      this.newPictures = [];
      const refreshed = await fetch(`http://localhost:3000/spot/${this.spot.spot_id}`);
      const updated = await refreshed.json();
      this.$emit('changePage', 'propertyDetail', updated);
    },
    async saveAllChanges() {
      const payload = {
        name: this.editableSpot.name,
        base_price: this.editableSpot.base_price,
        description: this.editableSpot.description,
        amenities: this.editableSpot.amenities
      };
      const res = await fetch(`http://localhost:3000/spot/${this.spot.spot_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const updated = await res.json();
      console.log('All fields saved. Updated spot:', updated);
      this.$emit('changePage', 'propertyDetail', updated);
    },
    formatDate(d) {
      return new Date(d).toLocaleDateString();
    },
    statusText(id) {
      return id === 1 ? 'Pending' : id === 2 ? 'Confirmed' : id === 3 ? 'Declined' : 'Unknown';
    },
    async updateBookingStatus(id, status) {
      await fetch(`http://localhost:3000/booking/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: status })
      });
      const refreshed = await fetch(`http://localhost:3000/spot/${this.spot.spot_id}`);
      const updated = await refreshed.json();
      this.$emit('changePage', 'propertyDetail', updated);
    },
    async deleteSpot() {
      if (!confirm('Delete this spot?')) return;
      await fetch(`http://localhost:3000/spot/${this.spot.spot_id}`, { method: 'DELETE' });
      this.$emit('changePage', 'profile');
    },
    goBack() {
      this.$emit('changePage', 'profile');
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
  font-size: 1.25rem; 
  color: #555; 
  margin-bottom: 1rem; 
}
.property-card { 
  background: #fff; 
  padding: 1.5rem; 
  border-radius: 8px; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
}
.spot-images { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.5rem; 
  margin-bottom: 1rem; 
}
.gallery-item { 
  width: 100px; 
  height: 75px; 
  overflow: hidden; 
  border-radius: 4px; 
}
.spot-image { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}
.no-pics { 
  font-style: italic; 
  color: #888; 
}
.upload-section { 
  margin-bottom: 1rem; 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
}
.upload-btn, .add-btn, .save-btn, .cancel-btn, .edit-btn, .delete-btn { 
  cursor: pointer; 
  border: none; 
  border-radius: 4px; 
}
.upload-btn { 
  background: #176a02; 
  color: #fff; 
  padding: 0.4rem 0.8rem; 
}
.edit-btn { 
  background: #176a02; 
  color: #fff; 
  padding: 0.3rem 0.6rem; 
  margin-left: 0.5rem; 
}
.save-btn { 
  background: #176a02; 
  color: #fff; 
  padding: 0.3rem 0.6rem; 
  margin-left: 0.5rem; 
}
.cancel-btn { 
  background: #f3f4f6; 
  color: #333; 
  padding: 0.3rem 0.6rem; 
  margin-left: 0.5rem; 
}
.add-btn { 
  background: #176a02; 
  color: #fff; 
  padding: 0.4rem 0.8rem; 
}
.delete-btn { 
  background: #ef4444; 
  color: #fff; 
  padding: 0.5rem 1rem; 
  margin-top: 1rem; 
}
.row { 
  display: flex; 
  align-items: center; 
  margin-bottom: 0.75rem; 
}
.row label { 
  width: 100px; 
  font-weight: bold; 
}
.row input, .row textarea { 
  flex: 1; 
  padding: 0.4rem; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
}
.amenity-list { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
}
.amenity-edit { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.5rem; 
}
.new-amenity-row { 
  display: flex; 
  gap: 0.5rem; 
  margin: 0.5rem 0; 
}
.booking-list { 
  list-style: none; 
  padding: 0; 
}
.status-badge { 
  padding: 0.2rem 0.6rem; 
  border-radius: 4px; 
  font-size: 0.85rem; 
  margin-right: 0.5rem; 
}
.status-1 { 
  background: #facc15; 
}
.status-2 { 
  background: #176a02; 
  color: #fff; 
}

.status-3 { 
  background: #ef4444; 
  color: #fff; 
}
.action-buttons button { 
  margin-left: 0.5rem; 
}
.footer { 
  margin-top: 1rem; 
}
.save-all-row { 
  margin: 1rem 0; 
  text-align: center; 
}
.save-all-btn { 
  background: #176a02; 
  color: white; 
  padding: 0.6rem 1.2rem; 
  border: none; 
  border-radius: 4px; 
  cursor: pointer; 
}
.booker {
  margin-bottom: 0.25rem;
  display: block;
}
.reviews-section {
  margin-top: 2rem;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
}
.review-item {
  border-bottom: 1px solid #ddd;
  padding: 0.5rem 0;
}
.review-item:last-child {
  border: none;
}
.review-date {
  color: #666;
  font-size: 0.9em;
  margin-left: 0.5em;
}
.review-comment {
  font-style: italic;
  margin: 0.25rem 0 0.75rem;
}
.no-reviews .no-bookings {
  color: #888;
  font-style: italic;
}
</style>
