<template>
    <div class="signup-container">
      <LogoHeader></LogoHeader> 
      <h2>Sign up</h2>
      <!-- Signup form here -->
      <div class="form-section">
        <input type="email" placeholder="Email" v-model="email" />
        <input type="text" placeholder="Name" v-model="name" />
        <input type="password" placeholder="Password" v-model="password" />
        <input type="password" placeholder="Confirm Password" v-model="confirmPassword" />
        <button class="btn" @click="handleSignup">Sign Up</button>
      </div>

      <GoBackBtn @goBack="goBack" />
  </div>
  </template>
  
  <script>
  import GoBackBtn from '@/components/GoBackBtn.vue';
  import LogoHeader from '@/components/LogoHeader.vue';
  export default {
    name: 'SignupPage',
    components: {
      GoBackBtn,
      LogoHeader
    },
    data() {
      return {
        email: "",
        name: "",
        password: "",
        confirmPassword: ""
      };
    },
    methods: {
      goBack() {
        this.$emit('changePage', 'welcome');
      },
      async handleSignup() {
        if (this.password !== this.confirmPassword) {
          alert("Passwords do not match!");
          return;
        }
        try {
          const response = await fetch("http://localhost:3000/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: this.email,
              name: this.name,
              password: this.password
            })
          });

          const data = await response.json();

          if (data.user_id) {
          localStorage.setItem("user", JSON.stringify(data));
          this.$emit('changePage', 'home'); // Go to HomePage.vue
        } else {
          alert(data.message || "Signup failed.");
        }
        } catch (error) {
          console.error("Signup error:", error);
          alert("Signup failed: " + error.message);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .signup-container {
  position: relative;
  min-height: 100vh;
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

/* Form layout */
.form-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  max-width: 300px;
}

input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.btn {
  background-color: #176A02;
  color: white;
  padding: 0.6rem 1.2rem;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  width: 100%;
}

  </style>