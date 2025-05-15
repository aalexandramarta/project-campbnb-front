<template>
  <div class="booking-panel">
    <h3>Book This Spot</h3>

    <div class="date-filter">
      <label for="checkIn">Check-in</label>
      <Datepicker
        id="checkIn"
        :value="rawCheckIn"
        @selected="onSelectCheckIn"
        :disabled-dates="disabledDatesCheckIn"
        placeholder="Select date"
      />
    </div>

    <div class="date-filter">
      <label for="checkOut">Check-out</label>
      <Datepicker
        id="checkOut"
        :value="rawCheckOut"
        @selected="onSelectCheckOut"
        :disabled-dates="disabledDatesCheckOut"
        placeholder="Select date"
      />
    </div>

    <p v-if="dateError" class="error-message">
      Check-in must be before check-out.
    </p>

    <p>{{ spot.base_price }} € per night</p>
    <p v-if="totalPrice > 0">
      <strong>Total:</strong> {{ totalPrice }} €
    </p>

    <button @click="bookSpot">Book Now</button>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';

export default {
  name: 'BookingPanel',
  components: { Datepicker },
  props: {
    spot: { type: Object, required: true },
    initialCheckIn: { type: String, required: false, default: null },
    initialCheckOut:{ type: String, required: false, default: null }
  },
  data() {
    return {
      rawCheckIn: this.initialCheckIn ? new Date(this.initialCheckIn) : null,    // Date from before
      rawCheckOut: this.initialCheckOut ? new Date(this.initialCheckOut) : null,   // Date from before
      checkIn: null,       
      checkOut: null,      
      dateError: false
    };
  },
  mounted() {
  if (this.rawCheckIn) {
    this.checkIn = new Date(this.rawCheckIn.getFullYear(), this.rawCheckIn.getMonth(), this.rawCheckIn.getDate(), 16, 0, 0);
  }
  if (this.rawCheckOut) {
    this.checkOut = new Date(this.rawCheckOut.getFullYear(), this.rawCheckOut.getMonth(), this.rawCheckOut.getDate(), 12, 0, 0);
  }
  },
  computed: {
    totalPrice() {
      if (!this.checkIn || !this.checkOut) return 0;
      const msPerDay = 1000 * 60 * 60 * 24;
      const nights = Math.ceil((this.checkOut - this.checkIn) / msPerDay);
      return nights > 0 ? nights * this.spot.base_price : 0;
    },

    // For check-in: disable any date d where  start ≤ d < end
    disabledDatesCheckIn() {
     return {
      customPredictor: date => {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        return this.spot.booking.some(b => {
          // normalize booking start & end to midnight:
          const startDay = new Date(b.start_date);
          startDay.setHours(0, 0, 0, 0);

          const endDay = new Date(b.end_date);
          endDay.setHours(0, 0, 0, 0);

          // disable any day from startDay (inclusive) up to endDay (exclusive)
          return d >= startDay && d < endDay;
          });
        }
      };
    },

    // For check-out: disable any date d where  start < d ≤ end
    disabledDatesCheckOut() {
      return {
      customPredictor: date => {
        if (!this.checkIn) return false;
        // normalize both dates to midnight
        const d  = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const ci = new Date(this.checkIn.getFullYear(), this.checkIn.getMonth(), this.checkIn.getDate());

        // no checkout on or before checkIn
        if (d <= ci) return true;

        // check overlaps on existing bookings
        return this.spot.booking.some(b => {
          const s = new Date(b.start_date), e = new Date(b.end_date);
          s.setHours(0,0,0,0);
          e.setHours(0,0,0,0);
          // overlap happens if checkIn < booking.end and chosen day > booking.start
          return ci < e && d > s;
        });
      }
    };
    }
  },
  methods: {
    onSelectCheckIn(val) {
      this.rawCheckIn = val;
      if (val) {
        this.checkIn = new Date(val.getFullYear(), val.getMonth(), val.getDate(), 16, 0, 0);
      } else {
        this.checkIn = null;
      }
    },
    onSelectCheckOut(val) {
      this.rawCheckOut = val;
      if (val) {
        this.checkOut = new Date(val.getFullYear(), val.getMonth(), val.getDate(), 12, 0, 0);
      } else {
        this.checkOut = null;
      }
    },
    async bookSpot() {
      this.dateError = false;
      if (!this.checkIn || !this.checkOut || this.checkIn >= this.checkOut) {
        this.dateError = true;
        return;
      }

      // safety check
      const conflict = this.spot.booking.some(b => {
        const s = new Date(b.start_date);
        const e = new Date(b.end_date);
        return this.checkIn < e && this.checkOut > s;
      });
      if (conflict) {
        alert('Conflict with existing booking.');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.user_id) {
        alert('Please log in.');
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
        alert('Booked!');
        this.$emit('bookingSuccess');
        this.$emit('changePage', 'home');
      } catch (err) {
        console.error(err);
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
