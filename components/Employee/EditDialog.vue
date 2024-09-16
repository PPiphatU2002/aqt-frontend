<template>
  <div>
    <ModalConfirm :open="modal.confirm.open" :message="modal.confirm.message" :confirm.sync="modal.confirm.open"
      :method="handleConfirmMethod" />
    <ModalComplete :open="modal.complete.open" :message="modal.complete.message" :complete.sync="modal.complete.open"
      :method="goBack" />
    <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />

    <v-dialog persistent :retain-focus="false" v-model="open" v-if="data" max-width="400" max-height="300"
      content-class="rounded-xl">
      <v-card class="rounded-xl">
        <v-card-title class="card-title-center mb-7">แก้ไขรายละเอียดผู้ใช้</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="6" sm="5" class="pa-0 mr-4 ml-6">
                <v-text-field v-model="data.fname" :rules="[(v) => !!v || 'โปรดกรอกชื่อ']" label="ชื่อ" outlined
                  required>
                </v-text-field>
              </v-col>
              <v-col cols="6" sm="5" class="pa-0">
                <v-text-field v-model="data.lname" :rules="[(v) => !!v || 'โปรดกรอกนามสกุล']" label="นามสกุล" outlined
                  required>
                </v-text-field>
              </v-col>
              <v-col cols="6" sm="5" class="pa-0 mr-4 ml-6">
                <v-text-field v-model="data.phone"
                  :rules="[(v) => !!v || 'โปรดกรอกเบอร์โทรศัพท์', (v) => (v && v.length === 10) || 'เบอร์โทรศัพท์ต้องมี 10 หลัก',]"
                  label="เบอร์โทรศัพท์" outlined required>
                </v-text-field>
              </v-col>
              <v-col cols="6" sm="5" class="pa-0">
                <v-select v-model="data.gender" :items="genderOptions" :rules="[(v) => !!v || 'โปรดเลือกเพศ']"
                  label="เพศ" outlined required></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="card-title-center pa-0">
          <v-btn @click="confirm" :disabled="!valid || !data.fname || !data.lname || !data.phone" depressed
            color="#24b224" class="font-weight-medium mr-2 mb-5">
            บันทึก
          </v-btn>
          <v-btn color="#e50211" @click="cancel" class="font-weight-medium mb-5">ยกเลิก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from 'moment';
moment.locale('th');

export default {
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
      valid: false,
      genderOptions: [],
      originalData: {},

      modal: {
        confirm: {
          open: false,
          message: 'ยืนยันการแก้ไขข้อมูล?',
        },
        complete: {
          open: false,
          message: 'แก้ไขข้อมูลสำเร็จ',
        },
        error: {
          open: false,
          message: 'โปรดกรอกข้อมูลให้ครบถ้วน',
        },
      },
    }
  },

  mounted() {
    this.setGenderOptions();
    this.originalData = { ...this.data };
    document.addEventListener('keydown', this.handleKeydown);
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  },

  methods: {
    setGenderOptions() {
      const allGenders = ['ชาย', 'หญิง', 'ไม่ระบุ'];
      if (this.data && this.data.gender) {
        this.genderOptions = [this.data.gender, ...allGenders.filter(g => g !== this.data.gender)];
      } else {
        this.genderOptions = allGenders;
      }
    },

    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.cancel();
      } else if (event.key === 'Enter') {
        this.confirm();
      }
    },

    async confirm() {
      this.modal.confirm.open = true;
      await new Promise((resolve) => {
        this.$watch('modal.confirm.open', (newValue) => {
          if (!newValue) {
            resolve();
          }
        });
      });
      if (!this.modal.confirm.open) {
      }
    },

    async updateData() {
      try {
        const req = await this.$store.dispatch('api/employee/updateEmployee', this.data);
        console.log('Response:', req);
        this.recordLogUpdate();
        this.modal.complete.open = true;
      } catch (error) {
        this.modal.error.open = true;
      }
    },

    cancel() {
      this.modal.confirm.open = false;
      this.$emit('update:edit', false);
    },

    recordLogUpdate() {
      const changes = [];
      if (this.data.fname !== this.originalData.fname) {
        changes.push('NAME ' + this.data.fname + '\n');
      }
      if (this.data.lname !== this.originalData.lname) {
        changes.push('SUR ' + this.data.lname + '\n');
      }
      if (this.data.phone !== this.originalData.phone) {
        changes.push('PHONE ' + this.data.phone + '\n');
      }
      if (this.data.gender !== this.originalData.gender) {
        changes.push('GENDER ' + this.data.gender + '\n');
      }

      const log = {
        emp_name: `${this.data.fname} ${this.data.lname}`,
        emp_email: this.$auth.user.email,
        detail: changes.join(''),
        type: 4,
        picture: this.data.picture || 'Unknown',
        action: 'แก้ไขข้อมูลส่วนตัว',
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      }
      console.log(log);
      this.$store.dispatch('api/log/addLogs', log);
    },

    goBack() {
      window.location.reload();
    },

    handleConfirmMethod() {
      this.modal.confirm.open = false;
      this.updateData();
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

.file-input {
  margin-bottom: 0px !important;
}

.v-card-actions {
  padding: 0 !important;
}

.v-btn {
  margin-top: 0px !important;
}
</style>
