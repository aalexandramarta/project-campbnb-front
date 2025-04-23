<template>
    <div class="booking-panel">
      <h3>Book This Spot</h3>
      <div class="date-filter">
          <label for="checkIn">Check-in</label>
          <input id="checkIn" v-model="checkIn" type="date" class="filter-input" />
        </div>
        <div class="date-filter">
          <label for="checkOut">Check-out</label>
          <input id="checkOut" v-model="checkOut" type="date" class="filter-input" />
        </div>
        <p v-if="dateError" class="error-message">Check-in date must be before check-out date.</p>
      <p>{{ spot.base_price }} € per night</p>
      <p v-if="totalPrice > 0"><strong>Total:</strong> {{ totalPrice }} €</p>
      <button @click="bookSpot">Book Now</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BookingPanel',
    data(){
        return {
        dateError: false,
        checkIn: '',
        checkOut: ''
        }
    },
    props: ['spot'],
    computed: {
        totalPrice() {
            if (this.checkIn && this.checkOut) {
            const checkInDate = new Date(this.checkIn);
            const checkOutDate = new Date(this.checkOut);
            const diffTime = checkOutDate - checkInDate;
            const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return nights > 0 ? nights * this.spot.base_price : 0;
            }
            return 0;
        }
    },
    methods: {
        async bookSpot() {
            this.dateError = false;

            const checkInDate = new Date(this.checkIn);
            const checkOutDate = new Date(this.checkOut);

            // Basic date validation
            if (!this.checkIn || !this.checkOut || checkInDate >= checkOutDate) {
            this.dateError = true;
            return;
            }


            // Check for overlapping bookings
            const hasConflict = this.spot.booking.some(b => {
            const bookedStart = new Date(b.start_date);
            const bookedEnd = new Date(b.end_date);
            return (checkInDate < bookedEnd && checkOutDate > bookedStart);
            });

            if (hasConflict) {
            alert("Selected dates are not available. Please choose a different range.");
            return;
            }

            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.user_id;

            if (!userId) {
            alert("User not logged in. Please log in to book.");
            return;
            }
            
            const formattedCheckIn = checkInDate.toISOString();
            const formattedCheckOut = checkOutDate.toISOString();

            // No conflicts, proceed to post the booking
            try {
            const response = await fetch('http://localhost:3000/booking', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                user_id: userId, 
                spot_id: this.spot.spot_id,
                start_date: formattedCheckIn,
                end_date: formattedCheckOut,
                status_id: 1,
                price: this.spot.base_price
                })
            });

            const result = await response.json();
            

            if (response.ok) {
                alert("Booking successful!");
                // Optionally: emit event or update parent component
                this.$emit('changePage', 'home');
            } else {
                alert("Error creating booking: " + result.message);
            }
            } catch (err) {
            console.log("Booking error:", err);
            alert("An error occurred while booking.");
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
  </style>