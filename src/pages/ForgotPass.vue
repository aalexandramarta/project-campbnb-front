<template>
    <div class="login-container">
      
      <LogoHeader></LogoHeader>
      <h2>Forgot password</h2>
      <div class="form-section">
        <div class="input-section">
          <input
            id="input_email"
            type="email"
            placeholder="Email"
            v-model="email"
          />
          <button class="btn"  @click="handleSend">Send</button>
        
        <p v-if="message" :style="{ color: messageType === 'error' ? 'red' : 'green' }">
          {{ message }}
        </p>
        </div>
      
    </div>


      <GoBackBtn @goBack="goBack" />
  </div>
  </template>
  <script>
  import GoBackBtn from '@/components/GoBackBtn.vue';
  import LogoHeader from '@/components/LogoHeader.vue';

  export default {
  name: 'LoginPage',
  components: {
    GoBackBtn,
    LogoHeader
  },
  data() {
    return {
        email: "",
        message: '',
        messageType: 'success', // or 'error'
    }
  },
  methods: {
    goBack() {
      this.$emit('changePage', 'login');
      },
      async handleSend() {
        if (!this.email) {
        this.message = 'Please enter your email';
        this.messageType = 'error';
        return;
        }

        try {
        const response = await fetch('http://localhost:3000/password-reset/request', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: this.email })
        });

        if (!response.ok) {
            throw new Error('Request failed');
        }

        this.message = 'Password reset link sent! Check your email.';
        this.messageType = 'success';
        } catch (err) {
        this.message = 'Error sending reset link. Please try again.';
        this.messageType = 'error';
        }
        }
      
    }
  }
  </script>
  
  <style scoped>
    
.login-container {
  position: relative;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}

h2 {
  margin-bottom: 1rem;
}

.form-section {
  display: flex;
  justify-content: center;
  width: 100%;
}

.input-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

.input-section input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  box-sizing: border-box;
}

.btn {
  background-color: #176A02;
  color: white;
  padding: 0.6rem 1.2rem;
  text-decoration: none;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
}
  </style> 
