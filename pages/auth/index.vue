<template>
  <div>
  <ModalComplete
    :open="modal.complete.open"
    :message="modal.complete.message"
    :complete.sync="modal.complete.open"
  />
  <ModalError
    :open="modal.error.open"
    :message="modal.error.message"
    :error.sync="modal.error.open"
  />
  <div class="d-flex justify-center">
    <v-card class="mx-auto my-12 rounded-xl" max-width="800" max-height="1000">
      <v-card-title>
        WELCOME!   
      </v-card-title>
        <v-card-text>
          <v-text-field 
            v-model = "form.email"
            label="E-MAIL"
            outlined>
          </v-text-field>
          <v-text-field 
            v-model="form.password"
            label="PASSWORD" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :type="show1 ? 'text' : 'password'" @click:append="show1 = !show1" 
            outlined>
          </v-text-field>
          <v-card-actions>
            <div>
              <v-btn 
                @click="login" 
                :disabled="!form.email || !form.password"
                width="350" 
                class="mr-2" 
                color="success" >
                LOGIN
              </v-btn>
            </div>
          </v-card-actions>
        </v-card-text>
    </v-card>
  </div>
</div>
</template>

<script>
import moment from 'moment';
moment.locale('th');

export default {
layout: 'blank',

async mounted() {
      // await this.checkRole();
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
        message: 'Login Successful!',
      },
      error: {
        open: false,
        message: 'Login Failed!',
      },
    },
  }
},


methods: {
  async checkRole() {
          if (this.$auth.loggedIn) {
              const roleId = this.$auth.employee.ranks_id.toString();
              if (roleId === '1') {
                  console.log('Welcome Back Developer!');
                  this.$router.push('/developer/home');
              } else if (roleId === '2') {
                  console.log('Welcome Back Employee!');
                  this.$router.push('/employee/home');

              } else {
                  console.log('You Can Not Access This Page!');
                  this.$router.push('/auth');
              }
          } else {
              console.log('You Is Not Logged In!');
              this.$router.push('/auth');
          }
    },

  async login () {
    try {
      if (!this.form.email || !this.form.password) {
        this.modal.error.message = 'Please Fill In All Information Completely!';
        // this.recordLogError();
        return;
      }
      const req = await this.$auth.loginWith('local', {
        data: {
          email: this.form.email,
          password: this.form.password,
        }
      });
      // this.recordLog();
      this.modal.complete.open = true;
    } catch (error) {
      this.modal.error.open = true;
      // this.recordLogError();
    }
  },

  // recordLog(){
  //   const log = {
  //     emp_id: this.$auth.employee.no,
  //     type: 4,
  //     action: 'เข้าสู่ระบบ',
  //     time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  //   }
  //   console.log(log);

  //   this.$store.dispatch('api/log/addLogs', log);
  // },

  // recordLogError(){
  //   const log = {
  //     emp_id: this.$auth.employee.no,
  //     action: 'เข้าสู่ระบบไม่สำเร็จ',
  //     type_id: 4,
  //     time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  //   }
  //   console.log(log);

  //   this.$store.dispatch('api/log/addLogs', log);
  // },

},
}
</script>