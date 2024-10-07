<template>
  
  <div>
    <v-app :class="appBackground">
      <v-app-bar :clipped-left="clipped" fixed app :color="navBarColor" dark>
        <v-toolbar-title class="d-flex align-center" @click="home">
          <v-img src="http://localhost:3001/file/default/logo.png" max-width="120" contain />
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
          <v-btn text @click="gotoRegister" rounded :class="loginBtnClass">
            ลงทะเบียน
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
    gotoRegister() {
      this.$router.push('/auth/register');
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

</style>
