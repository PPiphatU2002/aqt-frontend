<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="error" dark flat>
                <v-toolbar-title>
                  {{ error ? pageNotFound : otherError }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="goHome">
                  <v-icon>mdi-home</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text>
                <v-alert
                  :value="true"
                  type="error"
                  elevation="2"
                  outlined
                >
                  {{ error ? error.message : otherError }}
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>

</template>

<script>
export default {
  name: 'EmptyLayout',
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      pageNotFound: 'ไม่พบหน้าที่คุณต้องการ',
      otherError: 'เกิดข้อผิดพลาด'
    }
  },
  methods: {
    goHome () {
      this.$router.push('/')
    }
  }
}
</script>
