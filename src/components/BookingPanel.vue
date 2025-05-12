<template>
  <div class="booking-panel">
    <h3>Book This Spot</h3>

    <div class="date-filter">
      <label for="checkIn">Check-in</label>
      <Datepicker
        id="checkIn"
        :value="checkIn"
        @selected="val => checkIn = val"
        :disabled-dates="disabledDates"
        placeholder="Select a date"
      />
    </div>

    <div class="date-filter">
      <label for="checkOut">Check-out</label>
      <Datepicker
        id="checkOut"
        :value="checkOut"
        @selected="val => checkOut = val"
        :disabled-dates="disabledDates"
        placeholder="Select a date"
      />
    </div>

    <p v-if="dateError" class="error-message">
      Check-in date must be before check-out date.
    </p>

    <p>{{ spot.base_price }} € per night</p>
    <p v-if="totalPrice > 0"><strong>Total:</strong> {{ totalPrice }} €</p>

    <button @click="bookSpot">Book Now</button>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';

export default {
  name: 'BookingPanel',
  components: { Datepicker },
  props: {
    spot: { type: Object, required: true }
  },
  data() {
    return {
      checkIn: null,
      checkOut: null,
      dateError: false
    };
  },
  computed: {
    totalPrice() {
      if (!this.checkIn || !this.checkOut) return 0;
      const msPerDay = 1000 * 60 * 60 * 24;
      // clear time portion
      const inDate  = new Date(this.checkIn.getFullYear(), this.checkIn.getMonth(), this.checkIn.getDate());
      const outDate = new Date(this.checkOut.getFullYear(), this.checkOut.getMonth(), this.checkOut.getDate());
      const nights = Math.ceil((outDate - inDate) / msPerDay);
      return nights > 0 ? nights * this.spot.base_price : 0;
    },
    disabledDates() {
      return {
        customPredictor: date => {
          // midnight normalize
          const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          return this.spot.booking.some(b => {
            const start = new Date(b.start_date);
            const end   = new Date(b.end_date);
            // disable only dates strictly inside [start, end)
            return d > start && d < end;
          });
        }
      };
    }
  },
  methods: {
    async bookSpot() {
      this.dateError = false;
      if (!this.checkIn || !this.checkOut || this.checkIn >= this.checkOut) {
        this.dateError = true;
        return;
      }

      // check conflicts (just in case)
      const hasConflict = this.spot.booking.some(b => {
        const s = new Date(b.start_date);
        const e = new Date(b.end_date);
        return this.checkIn < e && this.checkOut > s;
      });
      if (hasConflict) {
        alert('Selected dates conflict with an existing booking.');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.user_id) {
        alert('Please log in to book.');
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id:    user.user_id,
            spot_id:    this.spot.spot_id,
            start_date: this.checkIn.toISOString(),
            end_date:   this.checkOut.toISOString(),
            status_id:  1,
            price:      this.spot.base_price
          })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Booking failed');
        alert('Booking successful!');
        this.$emit('bookingSuccess');
        this.$emit('changePage', 'home');
      } catch (err) {
        console.error('Booking error:', err);
        alert('Error: ' + err.message);
      }
    }
  }
};
</script>

<style scoped>
.booking-panel {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
}
.date-filter {
  margin-bottom: 0.75rem;
}
.error-message {
  color: red;
  margin-bottom: 0.75rem;
}
button {
  background: #176a02;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
