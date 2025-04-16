<template>
    <button @click="$emit('goBack')" class="go-back-btn">
      ← Back
    </button>
  </template>
  
  <script>
  export default {
    name: 'GoBackButton'
  }
  </script>
  
  <style scoped>
  .go-back-btn {
    background-color: transparent;
    border: 1px solid #176A02;
    color: #176A02;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
  }
  </style>