<template>
  <div @keyup.enter="login" class="login-container">
    <ModalComplete :open="modal.complete.open" :message="modal.complete.message" :complete.sync="modal.complete.open" />
    <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
    <v-container fluid fill-height class="d-flex align-center justify-center">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title>
              <span class="headline">WELCOME!</span>
            </v-card-title>
            <v-card-subtitle>LOGIN WITH YOUR ACCOUNT</v-card-subtitle>
            <v-card-text>
              <v-text-field v-model="form.email" label="E-MAIL" prepend-icon="mdi-email" type="email" outlined dense
                class="small-text-field"></v-text-field>
              <v-text-field v-model="form.password" prepend-icon="mdi-lock" label="PASSWORD"
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :type="show1 ? 'text' : 'password'"
                @click:append="show1 = !show1" outlined dense class="small-text-field"></v-text-field>
              <v-btn @click="login" :disabled="!form.email || !form.password" color="primary" block>
                Log In
              </v-btn>
              <a @click="forgotPassword" class="forgot-password-text">
                Forgot Password?
              </a>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import moment from 'moment';
moment.locale('th');

export default {
  layout: 'blank',
  name: 'Login',

  async mounted() {
    await this.checkRank();
  },

  watch: {
    open(val) {
      if (val) {
        document.addEventListener('keydown', this.handleKeydown);
      } else {
        document.removeEventListener('keydown', this.handleKeydown);
      }
    },
  },

  data() {
    return {
      valid: false,
      show1: false,
      show2: false,

      form: {
        email: '',
        password: '',
      },
      modal: {
        complete: {
          open: false,
          message: 'LOGIN SUCCESSFUL!',
        },
        error: {
          open: false,
          message: 'THE INFORMATION IS INCORRECT OR THE USER HAS NOT APPROVED IT!',
        },
      },
    }
  },

  methods: {
    async checkRank() {
      if (this.$auth.loggedIn) {
        const RankID = this.$auth.user.ranks_id.toString();
        if (RankID === '1') {
          console.log('Welcome Back Developer!');
          this.$router.push('/developer/home');
        } else if (RankID === '2') {
          console.log('Welcome Back Employee!');
          this.$router.push('/employee/home');
        } else {
          console.log('You Can Not Access This Page!');
          this.$router.push('/auth');
        }
      } else {
        console.log('User Is Not Logged In!');
        this.$router.push('/auth');
      }
    },

    async login() {
      try {
        await this.$auth.loginWith('local', {
          data: {
            email: this.form.email,
            password: this.form.password,
          }
        })
        const status = this.$auth.user.status.toString();
        if (status === '2') {
          return;
        };
        this.recordLog();
        this.modal.complete.open = true;
      } catch (error) {
        this.modal.error.open = true;
      }
    },



    forgotPassword() {
      this.$router.push('/auth/forgot_password');
    },

    handleKeydown(e) {
      if (e.key === 'Enter') {
        this.confirm();
      }
    },

    recordLog() {
      const log = {
        emp_id: this.$auth.user.no,
        type: 1,
        action: 'LOGIN',
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      }
      console.log(log);

      this.$store.dispatch('api/log/addLogs', log);
    },
  },
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.v-card {
  max-width: 400px;
  max-height: 600px;
  margin: auto;
}

.forgot-password-text {
  font-size: 0.85rem;
  color: #bf2b2b;
  text-align: left;
  cursor: pointer;
  text-decoration: none;
}

.small-text-field .v-input__control .v-input__slot {
  font-size: 0.75rem;
}

.small-text-field .v-text-field__slot {
  padding: 8px;
}
</style>
