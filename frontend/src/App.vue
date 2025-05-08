<template>
  <div id="app">
    <NavBar />
    <router-view />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<style>

#app {
  min-width: 100%; 
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #a5a5a5; 
}
</style>