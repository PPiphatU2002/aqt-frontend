<template>
  <div>
    <ModalConfirm :open="modal.confirm.open" :message="modal.confirm.message" :confirm.sync="modal.confirm.open"
      :method="UploadFile" />
    <ModalComplete :open="modal.complete.open" :message="modal.complete.message" :complete.sync="modal.complete.open"
      :method="goBack" />
    <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />

    <v-dialog persistent :retain-focus="false" v-model="open" v-if="data" max-width="300" max-height="200"
      content-class="rounded-xl">
      <v-card class="rounded-xl">
        <v-card-title>
          อัพโหลดรูปภาพ
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-file-input v-model="file" :rules="[
                  (v) => !!v || 'โปรดเลือกไฟล์',
                  (v) => (v && v.size < 15000000) || 'ไฟล์ต้องมีขนาดไม่เกิน 15 MB',
                  (v) => (v && ['image/jpeg', 'image/png'].includes(v.type)) || 'ไฟล์ต้องเป็นรูปภาพเท่านั้น',
                ]" accept="image/*" label="เลือกไฟล์" outlined required></v-file-input>
              </v-col>
              <v-col cols="12">
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="confirm" :disabled="!valid || file === null || file === undefined"
                    depressed class="font-weight-medium mt-3">
                    อัพโหลด
                  </v-btn>
                  <v-btn color="error" @click="cancel" class="font-weight-medium mt-3">ยกเลิก</v-btn>
                </v-card-actions>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
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
      date: new Date().toISOString().substr(0, 10),
      file: null,

      modal: {
        confirm: {
          open: false,
          message: 'ยืนยันการเปลี่ยนรูปภาพ?',
        },
        complete: {
          open: false,
          message: 'อัพโหลดรูปภาพสำเร็จ',
        },
        error: {
          open: false,
          message: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
        },
      },
    }
  },

  methods: {
    async confirm() {
      try {
        this.$emit('update:edit', false)
        this.modal.confirm.open = true
      } catch (error) {
        this.modal.error.open = true
      }
    },
    cancel() {
      this.$emit('update:edit', false)
    },

    async UploadFile() {
      try {
        const formData = new FormData();
        formData.append('file', this.file);

        // Upload the file
        const uploadResponse = await this.$store.dispatch('api/file/uploadProfile', formData);
        console.log('Upload response:', uploadResponse);

        // Prepare data for updating the avatar path
        const data = {
          no: this.data.no,
          picture: this.file.name,
        };
        console.log('Data:', data);

        // Update the file path in the database
        const updateResponse = await this.$store.dispatch('api/file/updateProfile', data);
        console.log('Update response:', updateResponse);

        // Show success modal
        this.modal.complete.open = true;

        // Log the update
        this.recordLogUpdate(this.data.id);
      } catch (error) {
        console.error('Error:', error);
        this.modal.error.message = 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ โปรดลองอีกครั้ง';
        this.modal.error.open = true;
      }
    },

    recordLogUpdate() {
      const empId = this.$auth.user.no;
      const employee = this.employees.find(employee => employee.no === empId);
      const employeeFName = employee ? employee.fname : 'Unknown';
      const employeeSName = employee ? employee.lname : 'Unknown';
      const employeeEmail = employee ? employee.email : 'Unknown';
      const employeePicture = employee ? employee.picture : 'Unknown';

      const log = {
        emp_name: employeeFName + ' ' + employeeSName,
        emp_email: employeeEmail,
        detail: 'Picture \n'+this.file.name,
        type: 4,
        picture: employeePicture,
        action: 'อัพโหลดรูปภาพ',
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      }
      console.log(log)
      this.$store.dispatch('api/log/addLogs', log)
    },

    async fetchEmployeeData() {
      this.employees = await this.$store.dispatch('api/employee/getEmployees');
    },

    goBack() {
      window.location.reload();
    },
  },
}
</script>
