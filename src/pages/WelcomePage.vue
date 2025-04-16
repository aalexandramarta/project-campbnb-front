<template>
    <div class="welcome-container">
      <h1>Welcome to</h1>
      <div class="logo-section">
        <img src="@/assets/campbnb-logo-transparent.png" alt="CampBnB Logo" class="logo" />
      </div>
      <div class="button-group">
        <button @click="goToLogin" class="btn">Log in</button> <!-- Trigger the login page -->
        <button @click="goToSignup" class="btn">Sign up</button> <!-- Trigger the signup page -->
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'WelcomePage',
    methods: {
      goToLogin() {
        this.$emit('changePage', 'login');
      },
      goToSignup() {
        this.$emit('changePage', 'signup');
      }
    }
  }
  </script>
  
  <style scoped>
  .welcome-container {
    text-align: center;
    padding: 2rem;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
  }
  
  .logo {
    width: 250px;
    height: auto;
    margin-right: 0.5rem;
  }
  
  
  .button-group {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
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