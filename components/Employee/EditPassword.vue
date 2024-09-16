<template>
  <div>
    <ModalConfirm :open="modal.confirm.open" :message="modal.confirm.message" :confirm.sync="modal.confirm.open"
      :method="updateData" />
    <ModalComplete :open="modal.complete.open" :message="modal.complete.message" :complete.sync="modal.complete.open"
      :method="goBack" />
    <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />

    <v-dialog persistent :retain-focus="false" v-model="open" v-if="data" max-width="400" max-height="300"
      content-class="rounded-xl">
      <v-card class="rounded-xl">
        <v-card-title class="headline font-weight-bold card-title-center mb-3">เปลี่ยนรหัสผ่าน</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="6" sm="5" class="ml-6 pa-0 mr-4">
                <v-text-field :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" :type="show2 ? 'text' : 'password'"
                  v-model="data.new_password" :rules="[
                    (v) => !!v || 'โปรดกรอกรหัสผ่านใหม่',
                    (v) => (v && v.length >= 8) || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
                  ]" @click:append="show2 = !show2" label="รหัสผ่านใหม่" required>
                </v-text-field>
              </v-col>
              <v-col cols="6" sm="5" class="pa-0">
                <v-text-field :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :type="show1 ? 'text' : 'password'"
                  v-model="data.confirm_password" :rules="[
                    (v) => !!v || 'โปรดยืนยันรหัสผ่านใหม่',
                    (v) => (v && v.length >= 8) || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
                    (v) => v === data.new_password || 'รหัสผ่านไม่ตรงกัน',
                  ]" @click:append="show1 = !show1" label="ยืนยันรหัสผ่านใหม่" required>
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="card-title-center">
          <v-btn color="#24b224" @click="confirm"
            :disabled="!valid || data.new_password === null || data.new_password === undefined || data.confirm_password === null || data.confirm_password === undefined"
            depressed class="font-weight-medium mb-5 mr-2">
            เปลี่ยน
          </v-btn>
          <v-btn color="#e50211" @click="cancel" class="font-weight-medium mb-5">
            ยกเลิก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from 'moment'
moment.locale('th')

export default {
  async mounted() {
    await this.fetchEmployeeData();
    document.addEventListener('keydown', this.handleKeydown);
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  },

  props: {
    method: { type: Function },
    open: {
      required: true,
    },
    data: {
      required: true,
    },
  },

  data() {
    return {
      employees: [],
      valid: false,
      confirm_password: '',
      password: '',
      new_password: '',
      show1: false,
      show2: false,

      modal: {
        confirm: {
          open: false,
          message: 'ยืนยันการเปลี่ยนรหัสผ่าน?',
        },
        complete: {
          open: false,
          message: 'เปลี่ยนรหัสผ่านสำเร็จ',
        },
        error: {
          open: false,
          message: 'โปรดกรอกข้อมูลให้ครบถ้วน',
        },
      },
    };
  },

  methods: {
    async confirm() {
      try {
        this.$emit('update:edit', false);
        this.modal.confirm.open = true;
      } catch (error) {
        this.modal.error.open = true;
      }
    },
    cancel() {
      this.$emit('update:edit', false);
    },

    async updateData() {
      try {
        if (this.data.new_password !== this.data.confirm_password) {
          this.modal.error.message = 'รหัสผ่านไม่ตรงกัน';
          this.modal.error.open = true;
          return;
        }
        this.data.password = this.data.new_password;

        const req = await this.$store.dispatch('api/employee/updatePassword', this.data);
        console.log('Response:', req);
        this.modal.complete.open = true;
        this.recordLogUpdate(this.data.no);
      } catch (error) {
        this.modal.error.message = 'เปลี่ยนรหัสผ่านไม่สำเร็จ';
      }
    },

    async fetchEmployeeData() {
      this.employees = await this.$store.dispatch('api/employee/getEmployees');
    },

    recordLogUpdate(no) {
      const empId = this.$auth.user.no;
      const employee = this.employees.find(employee => employee.no === empId);
      const employeeFName = employee ? employee.fname : 'Unknown';
      const employeeSName = employee ? employee.lname : 'Unknown';
      const employeeEmail = employee ? employee.email : 'Unknown';
      const employeePicture = employee ? employee.picture : 'Unknown';

      const log = {
        emp_name: employeeFName + ' ' + employeeSName,
        emp_email: employeeEmail,
        detail: 'NEW ' + this.data.new_password,
        type: 4,
        picture: employeePicture,
        action: 'เปลี่ยนรหัสผ่าน',
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      };
      console.log(log);
      this.$store.dispatch('api/log/addLogs', log);
    },

    goBack() {
      window.location.reload();
    },

    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.cancel();
      }
    },
  },
};
</script>

<style scoped>
.card-title-center {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
</style>
