<template>
    <div class="error-page">
      <h1>404 - Page Not Found</h1>
      <p>The Page You Are Looking For Doesn't Exist.</p>
      <router-link to="/" class="home-button">Go Back To Home</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Error'
  }
  </script>
  
  <style scoped>
  .error-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80vh; /* ให้หน้าเต็มความสูงของหน้าต่าง */
    text-align: center; /* จัดข้อความให้ตรงกลาง */
    color: #000000; /* สีข้อความ */
  }
  
  h1 {
    margin: 0;
    font-size: 2rem; /* ขนาดตัวอักษรสำหรับ h1 */
    color: #e50211; /* สีข้อความของ h1 */
    line-height: 1.2; /* ระยะห่างระหว่างบรรทัดของ h1 */
  }
  
  p {
    margin: 1rem 0;
    font-size: 1.2rem; /* ขนาดตัวอักษรสำหรับ p */
    color: #24b224; /* สีข้อความของ p */
    line-height: 1.4; /* ระยะห่างระหว่างบรรทัดของ p */
  }
  
  .home-button {
    display: inline-block;
    font-size: 1rem;
    color: #85d7df; /* สีตัวอักษรของปุ่ม */
    background-color: #000000; /* สีพื้นหลังของปุ่ม */
    padding: 0.5rem 1rem; /* ขนาดของปุ่ม */
    text-decoration: none; /* เอาขีดเส้นใต้ลิงก์ออก */
    border-radius: 5px; /* มุมปุ่มโค้ง */
    transition: background-color 0.3s ease; /* การเปลี่ยนสีพื้นหลังเมื่อโฮเวอร์ */
    line-height: 1.5; /* ระยะห่างระหว่างบรรทัดของปุ่ม */
    text-align: center; /* จัดข้อความในปุ่มให้ตรงกลาง */
  }
  
  .home-button:hover {
    background-color: #66b6c4; /* สีพื้นหลังของปุ่มเมื่อวางเมาส์ */
    text-decoration: none; /* เอาขีดเส้นใต้ลิงก์ออก */
  }
  </style>
