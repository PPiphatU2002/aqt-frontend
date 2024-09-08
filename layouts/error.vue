<template>
    <div class="error-page">
      <h1>404 - PAGE NOT FOUND</h1>
      <p>THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST.</p>
      <router-link to="/" class="home-button">GO BACK TO HOME</router-link>
    </div>
  </template>
  
  <script>
  export default {
  }
  </script>
  
  <style scoped>
  .error-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80vh;
    text-align: center;
    color: #000000;
  }
  
  h1 {
    margin: 0;
    font-size: 2rem;
    color: #e50211;
    line-height: 1.2;
  }
  
  p {
    margin: 1rem 0;
    font-size: 1.2rem;
    color: #24b224;
    line-height: 1.4;
  }
  
  .home-button {
    display: inline-block;
    font-size: 1rem;
    color: #85d7df;
    background-color: #000000;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    line-height: 1.5;
    text-align: center;
  }
  
  .home-button:hover {
    background-color: #66b6c4;
    text-decoration: none;
  }
  </style>
