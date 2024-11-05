<template>

  <div>
    <ModalConfirmLogout :open="modal.confirmLogout.open" :message="modal.confirmLogout.message"
      @update:confirmLogout="(value) => (modal.confirmLogout.open = value)"
      @update:message="(value) => (modal.confirmLogout.message = value)" :method="sign_out" />

    <v-app :class="appBackground">
      <v-app-bar :clipped-left="clipped" fixed app :color="navBarColor" dark>
        <v-toolbar-title class="d-flex align-center" @click="home">
          <v-img src="http://localhost:3001/file/default/logo.png" max-width="120" contain class="logo-img" />
        </v-toolbar-title>

        <v-menu bottom right :offset-y="true" :nudge-top="8" :nudge-right="8" class="user-menu">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text v-bind="attrs" v-on="on" rounded>
              <v-icon class="icon-host">mdi-account-outline</v-icon>
            </v-btn>
          </template>

          <v-list class="custom-list">
            <v-list-item @click="goToManagement" class="custom-list-item">
              <v-list-item-icon style="margin-right: 4px;">
                <v-icon class="icon-tab">mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title style="font-size: 0.8rem;">ข้อมูลลูกค้า</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="$auth.user.ranks_id === 1 || $auth.user.ranks_id === 3" @click="goToEmpManagement"
              class="custom-list-item">
              <v-list-item-icon style="margin-right: 4px;">
                <v-icon class="icon-tab">mdi-home-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title style="font-size: 0.8rem;">ข้อมูลสมาชิก</v-list-item-title>
              </v-list-item-content>
              <v-icon v-if="pendingEmployeesCount > 0" class="small-bell-icon"
                style="margin-left: 6px;">mdi-bell</v-icon>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu v-if="$auth.user.ranks_id === 1 || $auth.user.ranks_id === 3" bottom right :offset-y="true"
          :nudge-top="8" :nudge-right="8" class="user-menu">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text v-bind="attrs" v-on="on" rounded>
              <v-icon class="icon-host">mdi-archive-outline</v-icon>
            </v-btn>
          </template>

          <v-list class="custom-list">
            <v-list-item @click="goToStocksManagement" class="custom-list-item">
              <v-list-item-icon style="margin-right: 4px;">
                <v-icon class="icon-tab">mdi-archive</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title style="font-size: 0.8rem;">ข้อมูลหุ้น</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="goToStocksUpdate" class="custom-list-item">
              <v-list-item-icon style="margin-right: 4px;">
                <v-icon class="icon-tab">mdi-archive-arrow-up</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title style="font-size: 0.8rem;">อัพเดทหุ้น</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu bottom right :offset-y="true" :nudge-top="8" :nudge-right="8" class="user-menu">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text v-bind="attrs" v-on="on" rounded>
              <v-icon class="icon-host">mdi-history</v-icon>
            </v-btn>
          </template>

          <v-list class="custom-list">
            <v-list-item @click="goToTransHist" class="custom-list-item">
              <v-list-item-icon style="margin-right: 4px;">
                <v-icon class="icon-tab">mdi-cash-clock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title style="font-size: 0.8rem;">ประวัติการซื้อขายหุ้น</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="$auth.user.ranks_id === 1 || $auth.user.ranks_id === 3" @click="goToStocksHist"
              class="custom-list-item">
              <v-list-item-icon style="margin-right: 4px;">
                <v-icon class="icon-tab">mdi-archive-clock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title style="font-size: 0.8rem;">ประวัติหุ้น</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="goToUsersHist" class="custom-list-item">
              <v-list-item-icon style="margin-right: 4px;">
                <v-icon class="icon-tab">mdi-account-clock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title style="font-size: 0.8rem;">ประวัติลูกค้า</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="$auth.user.ranks_id === 1" @click="goToEmpsHist" class="custom-list-item">
              <v-list-item-icon style="margin-right: 4px;">
                <v-icon class="icon-tab">mdi-home-clock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title style="font-size: 0.8rem;">ประวัติพนักงาน</v-list-item-title>
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

          <v-menu bottom right :offset-y="true" :nudge-top="8" :nudge-right="8" class="user-menu" offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text v-bind="attrs" v-on="on" rounded :class="loginBtnClass">
                <v-icon>mdi-account-circle</v-icon>
              </v-btn>
            </template>

            <v-list class="custom-list">
              <v-card class="profile-card ml-2 mr-2 mt-2 mb-2 non-clickable">
                <v-img :src="profileImage" class="profile-image" @error="onImageError">
                </v-img>
              </v-card>

              <v-list-item @click="gotoProfile" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-card-account-details-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;">โปรไฟล์</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="buttonSignOut" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-logout</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;">ออกจากระบบ</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-snackbar v-if="$auth.user.ranks_id === 1 || $auth.user.ranks_id === 3" v-model="snackbar" :timeout="3000"
            style="width: 100px; height: 40px;" color="#24b224" absolute top right>
            <div class="snackbar-content">
              <v-icon class="small-bell-icon" style="margin-right: 8px; font-size: 16px;">mdi-bell</v-icon>{{
              snackbarText }}
            </div>
          </v-snackbar>

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

import moment from 'moment';
moment.locale('th');

export default {
  async mounted() {
    await this.fetchEmployeeData();
    await this.fetchPendingEmployeeCount();
    setInterval(async () => {
      await this.fetchPendingEmployeeCount();
    }, 10000);
  },

  data() {
    return {
      profileImage: `http://localhost:3001/file/profile/${this.$auth.user.picture}`,
      employees: [],
      pendingEmployeesCount: 0,
      clipped: false,
      fixed: false,
      menuActive: false,
      snackbar: false,
      snackbarText: '',
      modal: {
        confirmLogout: {
          open: false,
        },
      },
    };
  },

  methods: {
    async fetchPendingEmployeeCount() {
      try {
        const response = await this.$store.dispatch('api/employee/getEmployeesStatus', '2');
        const newCount = response.length;

        if (newCount !== this.pendingEmployeesCount) {
          this.pendingEmployeesCount = newCount;

          this.snackbarText = `มีคำร้องขอสมัครสมาชิก : ${this.pendingEmployeesCount} คน`;
          this.snackbar = true;
        }
      } catch (error) {
        console.error('Error fetching pending employees:', error);
      }
    },

    onImageError() {
      this.profileImage = `http://localhost:3001/file/default/${this.$auth.user.picture}`;
    },
    gotoProfile() {
      this.$router.push('/app/profile');
    },

    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },

    home() {
      this.$router.push('/app/home');
    },

    buttonSignOut() {
      this.modal.confirmLogout.open = true;
    },

    sign_out() {
      this.$auth.logout();
      this.recordLog();
    },

    async fetchEmployeeData() {
      this.employees = await this.$store.dispatch('api/employee/getEmployees');
    },

    async recordLog() {
      const empId = this.$auth.user.no;
      const employee = this.employees.find(employee => employee.no === empId);
      const employeeFName = employee ? employee.fname : 'Unknown';
      const employeeSName = employee ? employee.lname : 'Unknown';
      const employeeEmail = employee ? employee.email : 'Unknown';
      const employeePicture = employee ? employee.picture : 'Unknown';

      let userLocation = 'Unknown';
      let userIP = 'Unknown';

      try {
        const response = await fetch('https://ipinfo.io/json?token=a29d27593626a2');
        const data = await response.json();
        userLocation = `${data.city}, ${data.region}, ${data.country}`;
        userIP = data.ip;
      } catch (error) {
      }

      const log = {
        emp_name: employeeFName + ' ' + employeeSName,
        emp_email: employeeEmail,
        picture: employeePicture,
        type: 4,
        action: 'ออกจากระบบ',
        detail: `ที่อยู่ : ${userLocation}\nไอพี : ${userIP}`,
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      };
      this.$store.dispatch('api/log/addLogs', log);
    },

    goToManagement() {
      this.$router.push('/app/user/management');
    },

    goToEmpManagement() {
      this.$router.push('/app/user/employee_management');
    },

    goToTransHist() {
      this.$router.push('/app/history/transaction');
    },

    goToStocksHist() {
      this.$router.push('/app/history/stock');
    },

    goToUsersHist() {
      this.$router.push('/app/history/user');
    },

    goToEmpsHist() {
      this.$router.push('/app/history/employee');
    },

    goToStocksManagement() {
      this.$router.push('/app/stock/management');
    },

    goToStocksUpdate() {
      this.$router.push('/app/stock/update');
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
    },
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
  background-image: url('http://localhost:3001/file/default/background.png') !important;
  background-size: 45% !important;
  background-position: center;
  background-repeat: no-repeat;
}

.background-light {
  background-color: #fff6ea !important;
  background-image: url('http://localhost:3001/file/default/background.png') !important;
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
  padding: 0.4px 2px;
  background-color: #ffffff;
}

.custom-list-item {
  padding: 0.1px 8px;
  color: #000000;
}

.background-dark .custom-list {
  background-color: #ffffff !important;
}

.background-dark .custom-list-item {
  color: #000000 !important;
}

.background-light .custom-list {
  background-color: #000000 !important;
}

.background-light .custom-list-item {
  color: #ffffff !important;
}

.profile-card {
  width: 120px;
  height: 120px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.non-clickable {
  pointer-events: none;
}

@keyframes shake {
  0% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-10deg);
  }

  50% {
    transform: rotate(10deg);
  }

  75% {
    transform: rotate(-10deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

.small-bell-icon {
  font-size: 0.8rem;
  vertical-align: middle;
  color: #ffc800;
  animation: shake 0.8s ease infinite;
}

.v-snackbar {
  top: 50% !important;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
}

.snackbar-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  width: 100%;
}
</style>