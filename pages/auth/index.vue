<template>

  <div @keyup.enter="login" class="login-container">
    <ModalComplete :open="modal.complete.open" :message="modal.complete.message" :complete.sync="modal.complete.open" />
    <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
    <ModalWarning :open="modal.warning.open" :message="modal.warning.message" :warning.sync="modal.warning.open" />

    <v-container fluid fill-height class="d-flex align-center justify-center">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title style="justify-content: center; display: flex;">
              <span class="headline">ยินดีต้อนรับ</span>
            </v-card-title>
            <v-card-subtitle
              style="justify-content: center; display: flex;">เข้าสู่ระบบด้วยผู้ใช้งานของคุณ</v-card-subtitle>
            <v-card-text>
              <v-text-field v-model="form.email" label="อีเมล" prepend-icon="mdi-email" type="email" outlined dense
                class="small-text-field"></v-text-field>
              <v-text-field v-model="form.password" prepend-icon="mdi-lock" label="รหัสผ่าน"
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :type="show1 ? 'text' : 'password'"
                @click:append="show1 = !show1" outlined dense class="small-text-field"></v-text-field>

              <v-btn @click="login" :disabled="!form.email || !form.password" color="#24b224" block>
                เข้าสู่ระบบ
              </v-btn>
              <a @click="forgotPassword" class="forgot-password-text">
                ลืมรหัสผ่าน?
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

  async mounted() {
    await this.checkRank();
    await this.fetchEmployeeData();
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
      modal: {
        complete: {
          open: false,
          message: 'เข้าสู่ระบบสำเร็จ',
        },
        error: {
          open: false,
          message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        },
        warning: {
          open: false,
          message: 'ผู้ใช้นี้ยังไม่ได้รับการอนุมัติ',
        },
      },

      valid: false,
      show1: false,
      show2: false,
      employees: [],
      
      form: {
        email: '',
        password: '',
      },
    }
  },

  methods: {

    async fetchEmployeeData() {
      this.employees = await this.$store.dispatch('api/employee/getEmployees');
    },

    async checkRank() {
      if (this.$auth.loggedIn) {
        const Status = this.$auth.user.status.toString();
        const RankID = this.$auth.user.ranks_id.toString();
        if (Status === '2') {
          this.$router.push('/');
          this.modal.warning.open = true;
          await this.$auth.logout();
        }
        else {
          if (RankID === '1') {
            this.$router.push('/auth');
          } else if (RankID === '2') {
            this.$router.push('/auth');
          } else if (RankID === '3') {
            this.$router.push('/auth');
          } else {
            this.$router.push('/');
          }
        }
      } else {
        this.$router.push('/');
      }
    },

    async login() {
      try {
        await this.$auth.loginWith('local', {
          data: {
            email: this.form.email,
            password: this.form.password,
          }
        });
        if (this.$auth.user.status.toString() !== '2') {
          this.recordLog();
        }
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

    async recordLog() {
      const empId = this.$auth.user.no;
      const employee = this.employees.find(employee => employee.no === empId);
      const employeeFName = employee ? employee.fname : 'Unknown';
      const employeeSName = employee ? employee.lname : 'Unknown';
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
        emp_email: this.$auth.user.email,
        picture: employeePicture,
        type: 4,
        action: 'เข้าสู่ระบบ',
        detail: `LOCATION ${userLocation}\nIP ${userIP}`,
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      };
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
