<template>
  <div>
  <v-app dark>
    <v-app-bar :clipped-left="clipped" fixed app color="#4F6F52" dark>
      <v-toolbar-title class="text-uppercase font-weight-bold" @click="home">
        {{ title }}
      </v-toolbar-title>

      <v-spacer />
      <div class="d-flex" style="align-items: center">
          <v-btn @click="toggleTheme" rounded>
                <h4><v-icon>{{ $vuetify.theme.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon></h4>
          </v-btn>
          <v-btn text @click="gotoLogin" rounded>
                เข้าสู่ระบบ
          </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>

    <v-footer :absolute="!fixed" app>
          <span>&copy; {{ new Date().getFullYear() }}</span>
      </v-footer>
  </v-app>
  </div>
</template>

<script>
import moment from 'moment';
moment.locale('th');

export default {
  name: 'DefaultLayout',

  data() {
    return {
      title: 'EMP WAREHOUSES',
      clipped: false,
      fixed: false,
    };
  },
  methods: {

    gotoLogin() {
      this.$router.push('/auth/login');
    },

    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },

    home() {
      this.$router.push('/');
    },

  },
};
</script>
<style scoped>
</style>