<template>

    <div>
      <ModalConfirmLogout :open="modal.confirmLogout.open" :message="modal.confirmLogout.message"
        @update:confirmLogout="(value) => (modal.confirmLogout.open = value)"
        @update:message="(value) => (modal.confirmLogout.message = value)" :method="sign_out" />
  
      <v-app :class="appBackground">
        <v-app-bar :clipped-left="clipped" fixed app :color="navBarColor" dark>
          <v-toolbar-title class="d-flex align-center" @click="home">
            <v-img src="http://localhost:3001/file/profile/logo.png" max-width="120" contain
              class="logo-img" />
          </v-toolbar-title>
  
          <v-menu bottom right :offset-y="true" :nudge-top="8" :nudge-right="8" class="user-menu">
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
                  <v-list-item-title style="font-size: 0.8rem;">ลูกค้าใหม่</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
  
              <v-list-item @click="goToManagement" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-account-cog</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;">การจัดการลูกค้า</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
  
              <v-list-item @click="goToNewEmp" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-home-plus</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;">คำร้องขอสมัครสมาชิก</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
  
              <v-list-item @click="goToEmpManagement" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-home-account</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;">การจัดการพนักงาน</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
  
          <v-menu bottom right :offset-y="true" :nudge-top="8" :nudge-right="8" class="user-menu">
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
                  <v-list-item-title style="font-size: 0.8rem;">หุ้นใหม่</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
  
              <v-list-item @click="goToStocksManagement" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-archive-cog</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;">การจัดการหุ้น</v-list-item-title>
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
                  <v-icon class="icon-tab">mdi-archive-clock-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;">ประวัติการซื้อขายหุ้น</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
  
              <v-list-item @click="goToStocksHist" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-store-clock-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;">ประวัติหุ้น</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
  
              <v-list-item @click="goToUsersHist" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-account-clock-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title style="font-size: 0.8rem;">ประวัติลูกค้า</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
  
              <v-list-item @click="goToEmpsHist" class="custom-list-item">
                <v-list-item-icon style="margin-right: 4px;">
                  <v-icon class="icon-tab">mdi-home-clock-outline</v-icon>
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
                  <v-img :src="userProfilePicture" class="profile-image" />
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
    },
  
    data() {
      return {
        employees: [],
        clipped: false,
        fixed: false,
        menuActive: false,
        modal: {
          confirmLogout: {
            open: false,
          },
        },
      };
    },
  
    methods: {
      gotoProfile() {
        this.$router.push('/admin/profile');
      },
  
      toggleTheme() {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      },
  
      home() {
        this.$router.push('/admin/home');
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
          detail: `LOCATION ${userLocation}\nIP ${userIP}`,
          time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        };
        this.$store.dispatch('api/log/addLogs', log);
      },
  
      goToNewUser() {
        this.$router.push('/admin/user/new');
      },
  
      goToManagement() {
        this.$router.push('/admin/user/management');
      },
  
      goToNewEmp() {
        this.$router.push('/admin/user/new_employee');
      },
  
      goToEmpManagement() {
        this.$router.push('/admin/user/employee_management');
      },
  
      goToTransHist() {
        this.$router.push('/admin/history/transaction');
      },
  
      goToStocksHist() {
        this.$router.push('/admin/history/stock');
      },
  
      goToUsersHist() {
        this.$router.push('/admin/history/user');
      },
  
      goToEmpsHist() {
        this.$router.push('/admin/history/employee');
      },
  
      goToNewStock() {
        this.$router.push('/admin/stock/new_stock');
      },
  
      goToStocksManagement() {
        this.$router.push('/admin/stock/management');
      },
  
      goToStocksUpdate() {
        this.$router.push('/admin/stock/update');
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
  
      userProfilePicture() {
        const defaultPicture = 'http://localhost:3001/file/profile/person-icon.jpg';
        return this.$auth.user && this.$auth.user.picture
          ? `http://localhost:3001/file/profile/${this.$auth.user.picture}`
          : defaultPicture;
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
    background-image: url('http://localhost:3001/file/profile/background.png') !important;
    background-size: 45% !important;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  .background-light {
    background-color: #fff6ea !important;
    background-image: url('http://localhost:3001/file/profile/background.png') !important;
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
  
  </style>