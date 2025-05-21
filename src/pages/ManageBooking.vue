<template>
    <div class="manage-booking">
      <LogoHeader />
      <h2>Manage Booking</h2>
  
      <div v-if="booking">
        <!-- Spot & Host Info -->
        <p><strong>Spot:</strong> {{ booking.camping_spot?.name }}</p>
        <p><strong>Location:</strong> {{ booking.camping_spot?.location }}, {{ booking.camping_spot?.city?.name }}, {{ booking.camping_spot?.country?.name }}</p>
        <p><strong>Host:</strong> {{ booking.camping_spot?.user?.name }}</p>
        <p><strong>Host Email:</strong> {{ booking.camping_spot?.user?.email }}</p>

        <!-- Booking Status -->
        <p><strong>Status:</strong> {{ statusText(booking.status_id) }}</p>

  
        <!-- Dates & Pricing -->
        <p><strong>From:</strong> {{ formatDate(booking.start_date) }}</p>
        <p><strong>To:</strong> {{ formatDate(booking.end_date) }}</p>
        <p><strong>Price/night:</strong> {{ booking.camping_spot?.base_price }} €</p>
        <p><strong>Total:</strong> {{ totalPrice }} €</p>
  
        <!-- Pictures Gallery -->
        <div class="picture-gallery">
          <h3>Pictures</h3>
          <div v-if="booking.camping_spot?.pictures?.length" class="pictures">
            <img
              v-for="(pic, i) in booking.camping_spot.pictures"
              :key="i"
              :src="pic.url"
              alt="Spot picture"
              class="picture"
            />
          </div>
          <p v-else>No pictures available for this spot</p>
        </div>

        <!-- Your Existing Review -->
        <section v-if="existingReview" class="your-review">
            <h3>Your review</h3>
            <p><strong>Rating:</strong> {{ existingReview.rating }} / 5</p>
            <p><strong>Comment:</strong> {{ existingReview.comment }}</p>
        </section>
  
        <!-- Leave a Review form -->
        <section v-if="!existingReview && canReview" class="leave-review">
            <h3>Leave a Review</h3>
            <label>
            Rating:
            <select v-model.number="newRating">
                <option v-for="n in 5" :key="n" :value="n">{{ n }} / 5</option>
            </select>
            </label>
            <textarea
            v-model="newComment"
            placeholder="Share your experience…"
            rows="3"
            ></textarea>
            <button @click="submitReview">Submit Review</button>
        </section>

        <!-- Cancel Button: only if start_date is in the future -->
        <button
            v-if="canCancel"
            class="cancel-btn"
            @click="cancelBooking"
        >
            Cancel Booking
        </button>
        <p v-else class="cannot-cancel">
            You can no longer cancel this booking.
        </p>
        </div>
  
      <div v-else>
        <p>Loading booking details…</p>
      </div>
  
      <GoBackBtn @goBack="goBack" />
    </div>
  </template>
  
  <script>
  import LogoHeader from "@/components/LogoHeader.vue";
  import GoBackBtn from "@/components/GoBackBtn.vue";
  
  export default {
    name: "ManageBooking",
    props: ["booking"],
    components: { LogoHeader, GoBackBtn },
    data() {
        return {
        newRating:  5,
        newComment: ""
        };
    },
    computed: {
      totalPrice() {
        if (!this.booking) return 0;
        const start = new Date(this.booking.start_date);
        const end = new Date(this.booking.end_date);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const pricePerNight = parseFloat(this.booking.camping_spot.base_price);
        return nights * pricePerNight;
      },
      canCancel() {
        // only allow cancel if booking hasn't started yet
        return new Date(this.booking.start_date) > new Date();
        },
        canReview() {
        // only allow review if booking is over and user hasn't reviewed yet
        if (!this.booking) return false;
        const ended = new Date(this.booking.end_date) < new Date();
        const already = (this.booking.camping_spot.review || [])
            .some(r => r.user_id === this.booking.user_id);
        return ended && !already;
        },
        existingReview() {
            if (!this.booking?.camping_spot?.review) return null;
            return this.booking.camping_spot.review
            .find(r => r.user_id === this.booking.user_id) || null;
        }
    },
    methods: {
      formatDate(date) {
        return new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
      },
      async submitReview() {
        // post to your review endpoint
        await fetch("http://localhost:3000/review", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            user_id: this.booking.user_id,
            spot_id: this.booking.spot_id,
            rating:  this.newRating,
            comment: this.newComment
            })
        });
        this.newRating  = 5;
        this.newComment = "";
        // reload booking so future visits know they've reviewed
        const res     = await fetch(`http://localhost:3000/booking/${this.booking.booking_id}`);
        const updated = await res.json();
        this.$emit('refreshUser');
        this.$emit("changePage", "manageBooking", updated);
    },
      async cancelBooking() {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
          const res = await fetch(
            `http://localhost:3000/booking/${this.booking.booking_id}`,
            { method: "DELETE" }
          );
          if (res.ok) {
            alert("Booking cancelled");
            this.$emit("changePage", "profile");
          } else {
            const err = await res.json();
            alert("Failed to cancel: " + (err.message || res.statusText));
          }
        } catch (e) {
          console.error(e);
          alert("Error cancelling booking");
        }
      },
      goBack() {
        this.$emit("changePage", "profile");
      },
      statusText(id) {
        switch (id) {
          case 1: return "Pending";
          case 2: return "Confirmed";
          case 3: return "Declined";
          default: return "Unknown";
        }
      }
    }
  };
  </script>
  
  <style scoped>
.manage-booking {
padding: 2rem;
text-align: left;
}
.picture-gallery {
margin: 1.5rem 0;
}
.pictures {
display: flex;
flex-wrap: wrap;
gap: 1rem;
}
.picture {
width: 200px;
height: 150px;
object-fit: cover;
border-radius: 8px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.leave-review {
  margin: 1.5rem 0;
}
.leave-review label,
.leave-review textarea {
  display: block;
  width: 100%;
  margin-bottom: 0.5rem;
}
.leave-review button {
  background: #176A02;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}
.cancel-btn {
  background-color: #ef4444;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}
.cannot-cancel {
  color: #888;
  margin-top: 1rem;
}
.your-review {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.your-review h3 {
  margin-top: 0;
}
  </style>
  