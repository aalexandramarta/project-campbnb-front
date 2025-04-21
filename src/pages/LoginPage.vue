<template>
    <div class="login-container">
      
      <LogoHeader></LogoHeader>
      <h2>Log in</h2>
      <div class="form-section">
        <div class="input-section">
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
        localStorage.setItem("user", JSON.stringify(user)); // Save user
        this.$emit("changePage", "home"); // Navigate to homepage
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
    
    .login-container {
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