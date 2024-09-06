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

        <v-menu
            bottom
            right
            :offset-y="true"
            :nudge-top="8"
            :nudge-right="8"
            class="user-menu"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn text v-bind="attrs" v-on="on" rounded>
                <v-icon class="icon-host">mdi-account-outline</v-icon>
              </v-btn>
            </template>

            <v-list class="custom-list">
              <v-list-item @click="goToNewUser" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-account-plus</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;" >NEW USER</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="goToManagement" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-account-cog</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;" >MANAGEMENT</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>


            <v-menu
            bottom
            right
            :offset-y="true"
            :nudge-top="8"
            :nudge-right="8"
            class="user-menu"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn text v-bind="attrs" v-on="on" rounded>
                <v-icon class="icon-host">mdi-archive-outline</v-icon>
              </v-btn>
            </template>

            <v-list class="custom-list">
              <v-list-item @click="goToNewStock" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-archive-plus</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;" >NEW STOCKS</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="goToStocksManagement" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-archive-cog</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;" >MANAGEMENT</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="goToStocksUpdate" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-archive-arrow-up</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;" >UPDATE STOCKS</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-menu
            bottom
            right
            :offset-y="true"
            :nudge-top="8"
            :nudge-right="8"
            class="user-menu"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn text v-bind="attrs" v-on="on" rounded>
                <v-icon class="icon-host">mdi-history</v-icon>
              </v-btn>
            </template>

            <v-list class="custom-list">
              <v-list-item @click="goToTransHist" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-archive-clock-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;" >TRANSACTIONS HISTORY</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="goToStocksHist" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-store-clock-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;" >STOCKS HISTORY</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="goToUsersHist" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-account-clock-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;" >USERS HISTORY</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>

          
        <div class="d-flex align-center flex-grow-1"></div>

        <div class="d-flex align-center user-section">
          <v-btn @click="toggleTheme" rounded class="theme-toggle-btn">
            <h4>
              <v-icon :class="iconColor">
                {{ $vuetify.theme.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}
              </v-icon>
            </h4>
          </v-btn>

          <v-btn text @click="gotoProfile" rounded :class="loginBtnClass">
            Profile
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
      menuActive: false,
    };
  },
  methods: {
    gotoProfile() {
      this.$router.push('/employee/profile');
    },
    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    home() {
      this.$router.push('/employee/home');
    },

    goToNewUser() {
      this.$router.push('/employee/user/new');
    },
    goToManagement() {
      this.$router.push('/employee/user/management');
    },

    goToTransHist() {
      this.$router.push('/employee/history/transaction');
    },
    goToStocksHist() {
      this.$router.push('/employee/history/stock');
    },
    goToUsersHist() {
      this.$router.push('/employee/history/user');
    },
    
    goToNewStock() {
      this.$router.push('/employee/stock/new_stock');
    },
    goToStocksManagement() {
      this.$router.push('/employee/stock/management');
    },
    goToStocksUpdate() {
      this.$router.push('/employee/stock/update');
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
  cursor: pointer;
}

.theme-toggle-btn {
  background-color: #000000 !important;
  margin-right: 8px;
}

.day-icon {
  color: #ffc800 !important;
}

.night-icon {
  color: #85d7df !important;
}

.login-btn-night {
  background-color: #000000 !important;
  color: #85d7df !important;
}

.login-btn-day {
  background-color: #000000 !important;
  color: #ffc800 !important;
}

.background-dark {
  background-color: #545454 !important;
  background-image: url('https://xauusdmasters.in/assets/images/home2/1.png') !important;
  background-size: 45% !important;
  background-position: center;
  background-repeat: no-repeat;
}

.background-light {
  background-color: #fff6ea !important;
  background-image: url('https://xauusdmasters.in/assets/images/home2/1.png') !important;
  background-size: 45% !important;
  background-position: center;
  background-repeat: no-repeat;
}

.user-section {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.v-app-bar .user-section {
  margin-left: auto;
}

.icon-tab {
  font-size: 120% !important;
}

.icon-host {
  font-size: 220% !important;
}

.background-dark .icon-host {
  color: #ffffff !important;
}

.background-light .icon-host {
  color: #000000 !important;
}

.background-dark .icon-tab {
  color: #000000 !important;
}

.background-light .icon-tab {
  color: #ffffff !important;
}

.custom-list {
  padding: 0.4px 2px; /* ปรับขนาด padding ตามที่ต้องการ */
  background-color: #ffffff; /* สีพื้นหลังสำหรับธีม Dark */
}

.custom-list-item {
  padding: 0.1px 8px; /* ปรับขนาด padding ตามที่ต้องการ */
  color: #000000; /* ตัวอักษรสำหรับธีม Dark */
}

.background-dark .custom-list {
  background-color: #ffffff !important; /* สีพื้นหลังสำหรับธีม Light */
}

.background-dark .custom-list-item {
  color: #000000 !important; /* ตัวอักษรสำหรับธีม Light */
}

.background-light .custom-list {
  background-color: #000000 !important; /* สีพื้นหลังสำหรับธีม Dark */
}

.background-light .custom-list-item {
  color: #ffffff !important; /* ตัวอักษรสำหรับธีม Dark */
}
</style>
