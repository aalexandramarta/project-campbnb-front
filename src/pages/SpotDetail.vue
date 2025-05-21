<template>
  <div class="spot-detail" v-if="resolvedSpot">
    <LogoHeader />
    <h2 class="spot-title">{{ resolvedSpot.name }}</h2>

    <!-- Image Gallery -->
    <div class="spot-images">
      <img
        v-for="pic in resolvedSpot.pictures"
        :key="pic.picture_id"
        :src="pic.url"
        alt="Spot Image"
        class="spot-image"
      />
      <p v-if="!resolvedSpot.pictures.length" class="no-pics">No pictures available for this spot</p>
    </div>

    <div class="spot-content">
      <div class="overview">

        <p class="location"><strong>Location: </strong>{{ resolvedSpot.location }}, {{ resolvedSpot.city?.name }}, {{ resolvedSpot.country?.name }}</p>

        <p class="description"><strong>Description: </strong>{{ resolvedSpot.description }}</p>

        <div class="amenities">
          <h4>Amenities:</h4>
          <ul v-if="resolvedSpot.amenities.length">
            <li v-for="(a, i) in resolvedSpot.amenities" :key="i">- {{ a }}</li>
          </ul>
          <p v-else>No amenities available</p>
        </div>

        <div class="reviews">
          <h4>Reviews:</h4>
          <div v-if="resolvedSpot.review.length">
            <div v-for="(rev, idx) in resolvedSpot.review" :key="idx" class="review">
              <p><strong>{{ rev.user?.name || 'User' }}</strong>: {{ rev.rating }}/5 <br> {{ rev.comment }}</p>
            </div>
          </div>
          <p v-else>No reviews yet.</p>
        </div>
      </div>

      <button class="fav-btn" @click="toggleFavorite">
          {{ isFavorited ? "❤️ Remove from favorites" : "♡ Add to favorites" }}
      </button>

      <div class="booking-panel">
        <BookingPanel
          :spot="resolvedSpot"
          :initial-check-in="initialCheckIn"
          :initial-check-out="initialCheckOut"
          @changePage="setActivePage"
          @bookingSuccess="reloadSpot"
        />
      </div>
    </div>

    <GoBackBtn @goBack="goBack" />
  </div>
  <div v-else>
    <p>Loading spot details...</p>
  </div>
</template>

<script>
import GoBackBtn from '@/components/GoBackBtn.vue';
import LogoHeader from '@/components/LogoHeader.vue';
import BookingPanel from '@/components/BookingPanel.vue';

export default {
  name: 'SpotDetailPage',
  components: { GoBackBtn, LogoHeader, BookingPanel },
  props: {
    spot:     { type: Object, required: true },
    checkIn:  { type: String, required: false, default: null },
    checkOut: { type: String, required: false, default: null }
  },
  data() {
    return {
      resolvedSpot: null,
      isFavorited: false,
      initialCheckIn: this.checkIn,
      initialCheckOut:this.checkOut
    };
  },
  async mounted() {
    //get the current user
    const raw = localStorage.getItem('user');
    this.currentUser = raw ? JSON.parse(raw) : null; //if raw has a vaule parse it to a JSON object otherwise null

    //load the spot details
    if (this.spot?.spot_id) {
      await this.loadSpot(this.spot.spot_id);
    }

    // check spot is in the user's favorites
    this.isFavorited = Array.isArray(this.currentUser?.favorites) &&
                      this.currentUser.favorites.some(fav => fav.spot_id === this.spot.spot_id);

    console.log("SpotDetail mounted!", {
      spot:      this.spot,
      checkIn:   this.checkIn,
      checkOut:  this.checkOut
    });

  },
  watch: {
    spot: {
        async handler(newSpot) {
        if (!newSpot?.spot_id) return;
        await this.loadSpot(newSpot.spot_id);
        this.isFavorited = Array.isArray(this.currentUser?.favorites) &&
                          this.currentUser.favorites.some(fav => fav.spot_id === newSpot.spot_id);
      },
      checkIn(newVal)  { this.localCheckIn  = newVal; },
      checkOut(newVal) { this.localCheckOut = newVal; },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async loadSpot(id) {
      try {
        const res = await fetch(`http://localhost:3000/spot/${id}`);
        const data = await res.json();
        // amenity names
        const amenities = (data.amenities_spots || [])
          .map(as => as.amenities?.name)
          .filter(Boolean); //drops false entries
        this.resolvedSpot = { ...data, amenities };
      } catch (err) {
        console.error('Error loading spot:', err);
      }
    },
    reloadSpot() { 
      if (this.resolvedSpot?.spot_id) {
        this.loadSpot(this.resolvedSpot.spot_id);
      }
    },
    setActivePage(page) {
      this.$emit('changePage', page);
    },
    goBack() {
      this.$emit('changePage', 'home');
    },
    async toggleFavorite() {
      if (!this.currentUser) {
        alert("Please log in to manage favorites.");
        return;
      }

    try {
      if (this.isFavorited) {
        // remove favorite
        const fav = this.currentUser.favorites.find(f => f.spot_id === this.spot.spot_id);
        await fetch(`http://localhost:3000/favorite/${fav.favorite_id}`, { method: 'DELETE' });
        // remove it locally
        this.currentUser.favorites = this.currentUser.favorites.filter(f => f.spot_id !== this.spot.spot_id);
        this.isFavorited = false;
      } else {
        // add favorite
        const res = await fetch("http://localhost:3000/favorite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: this.currentUser.user_id,
            spot_id: this.spot.spot_id
          })
        });
        const created = await res.json();
        // add locally
        this.currentUser.favorites.push(created);
        this.isFavorited = true;
      }

      // update user to localStorage
      localStorage.setItem("user", JSON.stringify(this.currentUser));

      } catch (err) {
        console.error("Favorite toggle failed", err);
        alert("Something went wrong.");
      }
    }
  }
};
</script>

<style scoped>
.spot-detail { 
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
}

.spot-title { 
  font-size: 2rem;
  margin-bottom: 1rem; 
}
.spot-images {
  display: flex; 
  flex-wrap: wrap; 
  gap: 1rem; 
  margin-bottom: 1rem; 
}
.spot-image { 
  width: 300px; 
  height: 200px; 
  object-fit: cover; 
  border-radius: 8px; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
}
.no-pics { 
  font-style: italic; 
  color: #888; 
}
.spot-content { 
  display: flex; 
  gap: 2rem; 
  align-items: flex-start; 
}
.overview { 
  flex: 2; 
}
.booking-panel { 
  flex: 1; 
  background: #f9f9f9; 
  padding: 1rem; 
  border-radius: 8px; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
}
.amenities ul { 
  list-style: none; 
  padding: 0; 
}
.review { 
  border-bottom: 1px solid #ccc; 
  padding: 0.5rem 0; 
}
.fav-btn {
  background-color: #176a02;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  margin-bottom: 1rem;
  cursor: pointer;
}
.fav-btn:hover {
  opacity: 0.9;
}
</style>
