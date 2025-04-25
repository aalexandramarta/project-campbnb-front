<template>
    <div class="spot-detail" v-if="spot">
      <LogoHeader></LogoHeader> 
      <!-- Spot Name -->
        <h2 class="spot-title">{{ spot.name }}</h2>

        <!-- Image Gallery -->
        <div class="spot-images">
    <!-- <img v-for="(pic, index) in spot.pictures" :key="index" :src="pic.url" class="spot-image" /> -->
            <img class="spot-image" src="https://cdn2.acsi.eu/6/7/e/5/67e5567a7e743.jpg?impolicy=gallery-detail"/>   
        </div>

        <div class="spot-content">
        <!-- Left Column: Overview -->
        <div class="overview">
            <p class="description">{{ resolvedSpot.description }}</p>
            
            <div class="amenities">
                <h4>Amenities:</h4>
                <ul v-if="resolvedSpot && resolvedSpot.amenities && resolvedSpot.amenities.length > 0">
                    <li v-for="(a, i) in resolvedSpot.amenities" :key="i">
                        - {{ a}}
                    </li>
                </ul>
                <p v-else>No amenities available</p>
            </div>

            <div class="reviews">
            <h4>Reviews:</h4>
            <div v-if="resolvedSpot && resolvedSpot.review && resolvedSpot.review.length">
                <div v-for="(rev, idx) in resolvedSpot.review" :key="idx" class="review">
                <p><strong>{{ rev.user?.name || 'User' }}</strong>: {{ rev.comment }}</p>
                </div>
            </div>
            <div v-else>
                <p>No reviews yet.</p>
            </div>
        </div>
    </div>

    <!-- Right Column: Booking -->
    <div class="booking-panel">
        <BookingPanel :spot="spot" @changePage="setActivePage" />
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
    components: {
      GoBackBtn,
      LogoHeader,
      BookingPanel
    },
    data() {
      return {
        resolvedSpot: null
      };
    },
    methods: {
        goBack() {
            console.log("GoBack clicked, emitting changePage event");
            this.$emit('changePage', 'home');
        },
        mounted() {
            console.log("Amenities spots:", this.spot.amenities_spots);
        },
        setActivePage(page) {
          this.$emit('changePage', page);
        }
    },
    props: ['spot'],
    watch: {
      spot: {
        handler(newSpot) {
          if (newSpot) {
          // clone and resolve amenities
          const enriched = {
            ...newSpot,
            amenities: newSpot.amenities || 
              (newSpot.amenities_spots || []).map(a => a.amenities?.name).filter(Boolean)
          };
          this.resolvedSpot = enriched;
          }
        },
        immediate: true,
        deep: true
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

  .spot-detail-container {
  padding: 2rem;
}

.spot-title {
  font-size: 2rem;
  margin-bottom: 1rem;
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
  </style>
  