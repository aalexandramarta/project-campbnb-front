<template>
    <div class="login-container">
      
      <div class="logo-section">
          <img src="@/assets/campbnb-logo-transparent.png" alt="CampBnB Logo" class="logo" />
      </div>
      <h2>Log in</h2>
      <div class="form-section">
        <input
          id="input_email"
          type="email"
          placeholder="Email"
          v-model="email"
        />
        <input
          id="input_password"
          type="password"
          placeholder="Password"
          v-model="password"
        />
      <button class="btn" @click="fetchUser">Log in</button>
    </div>


      <GoBackBtn @goBack="goBack" />
  </div>
  </template>

  <script>
  import GoBackBtn from '@/components/GoBackBtn.vue';
  export default {
  name: 'LoginPage',
  components: {
    GoBackBtn
  },
  data() {
    return {
        email: "",
        password: ""
    }
  },
  methods: {
    goBack() {
      this.$emit('changePage', 'welcome');
      },
      fetchUser() {
        fetch("http://localhost:3000/user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        })
        .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        }
        return response.json();
      })
      .then((user) => {
        console.log("Login successful:", user);
        // Optional: emit event or navigate
        this.$emit("loginSuccess", user);
      })
      .catch((err) => {
        console.error("Login error:", err.message);
        alert("Login failed: " + err.message);
      });
      }
      
    }
  }
  </script>
  
  <style scoped>
    .logo-section {
    display: flex;
    align-items: right;
    justify-content: right;
    margin: 1rem 0;
  }
  
  .logo {
    width: 250px;
    height: auto;
    margin-right: 0.5rem;
  }
  .btn {
    background-color: #176A02;
    color: white;
    padding: 0.6rem 1.2rem;
    text-decoration: none;
    border-radius: 5px;
    font-size: 1rem;
  }
  </style> 