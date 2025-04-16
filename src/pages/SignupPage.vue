<template>
    <div class="signup-container">
    <h2>Signup</h2>
    <!-- Your signup form here -->

    <GoBackBtn @goBack="goBack" />
  </div>
  </template>
  
  <script>
  import GoBackBtn from '@/components/GoBackBtn.vue';
  export default {
    name: 'SignupPage',
    components: {
      GoBackBtn
    },
    methods: {
      goBack() {
        this.$emit('changePage', 'welcome');
      }
    }
  }
  </script>
  
  <style scoped>

  </style>