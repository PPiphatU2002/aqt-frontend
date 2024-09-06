<template>
  <div>
    <v-app :class="appBackground">
      <v-app-bar :clipped-left="clipped" fixed app :color="navBarColor" dark>
        <v-toolbar-title class="d-flex align-center" @click="home">
          <v-img
            src="https://img5.pic.in.th/file/secure-sv1/Logo9c6e72969abf7f59.md.png"
            max-width="120"
            contain
            class="logo-img"
          />
        </v-toolbar-title>

        <v-spacer />
        <div class="d-flex" style="align-items: center">
          <v-btn @click="toggleTheme" rounded class="theme-toggle-btn">
            <h4>
              <v-icon :class="iconColor">
                {{ $vuetify.theme.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}
              </v-icon>
            </h4>
          </v-btn>
          <v-btn text @click="gotoLogin" rounded :class="loginBtnClass">
            Log In
          </v-btn>
        </div>
      </v-app-bar>

      <v-main>
        <v-container>
          <nuxt />
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      fixed: false,
    };
  },
  methods: {
    gotoLogin() {
      this.$router.push('/auth');
    },

    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },

    home() {
      this.$router.push('/');
    },
  },
  computed: {
    iconColor() {
      return this.$vuetify.theme.dark ? 'night-icon' : 'day-icon';
    },
    loginBtnClass() {
      return this.$vuetify.theme.dark ? 'login-btn-night' : 'login-btn-day';
    },
    appBackground() {
      return this.$vuetify.theme.dark ? 'background-dark' : 'background-light';
    },
    navBarColor() {
      return this.$vuetify.theme.dark ? '#545454' : '#fff6ea';
    }
  }
};
</script>

<style scoped>
.logo-img {
  cursor: pointer; /* เปลี่ยนรูปเป็น icon มือเมื่อเลื่อนไปที่รูป */
}

.theme-toggle-btn {
  background-color: #000000 !important;
  margin-right: 8px; /* เว้นช่องว่างระหว่างปุ่มเปลี่ยนธีมและปุ่ม Login */
}

.day-icon {
  color: #ffc800 !important; /* สีสำหรับกลางวัน */
}

.night-icon {
  color: #85d7df !important; /* สีสำหรับกลางคืน */
}

.login-btn-night {
  background-color: #000000 !important; /* พื้นหลังของปุ่ม Login ตามธีมกลางคืน */
  color: #85d7df !important; /* สีตัวอักษรตามธีมกลางคืน */
}

.login-btn-day {
  background-color: #000000 !important; /* พื้นหลังของปุ่ม Login ตามธีมกลางวัน */
  color: #ffc800 !important; /* สีตัวอักษรตามธีมกลางวัน */
}

.background-dark {
  background-color: #545454 !important; /* สีพื้นหลังตามธีมกลางคืน */
  background-image: url('https://xauusdmasters.in/assets/images/home2/1.png') !important;
  background-size: 45% !important; /* ลดขนาดรูปภาพพื้นหลังเป็น 50% */
  background-position: center;
  background-repeat: no-repeat; /* ป้องกันการซ้ำซ้อนของรูปภาพพื้นหลัง */
}

.background-light {
  background-color: #fff6ea !important; /* สีพื้นหลังตามธีมกลางวัน */
  background-image: url('https://xauusdmasters.in/assets/images/home2/1.png') !important;
  background-size: 45% !important; /* ลดขนาดรูปภาพพื้นหลังเป็น 50% */
  background-position: center;
  background-repeat: no-repeat; /* ป้องกันการซ้ำซ้อนของรูปภาพพื้นหลัง */
}
</style>
