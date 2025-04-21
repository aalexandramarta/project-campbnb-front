<template>
    <div class="spot-card" @click="handleClick">
      <img :src="imageUrl" alt="Spot" class="spot-image" />
      <div class="spot-name">{{ spot.name }}</div>
      <div class="spot-price">{{ spot.base_price }} €/night</div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SpotCard',
    props: {
      spot: Object
    },
    computed: {
      imageUrl() {
        return this.spot.pictures?.[0]?.url || 'https://via.placeholder.com/150';
      }
    },
    methods: {
        handleClick() {
        // Emits the click with the spot data so the parent can handle it
        this.$emit('spotClicked', this.spot);
        }
    }
  };
  </script>
  
  <style scoped>
  .spot-card {
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 8px;
    box-sizing: border-box;
  }
  
  .spot-image {
    width: 100%;
    height: 130px;
    object-fit: cover;
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }
  
  .spot-name {
    font-weight: bold;
    margin-bottom: 0
  }
</style>  