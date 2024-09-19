<template>

  <div>
    <ModalConfirm :open="modal.confirm.open" :message="modal.confirm.message" :confirm.sync="modal.confirm.open"
      :method="handleConfirmMethod" />
    <ModalComplete :open="modal.complete.open" :message="modal.complete.message" :complete.sync="modal.complete.open"
      :method="goBack" />
    <ModalWarning :open="modal.warning.open" :message="modal.warning.message" :warning.sync="modal.warning.open" />

    <v-dialog persistent :retain-focus="false" v-model="open" v-if="data" max-width="400" max-height="300"
      content-class="rounded-xl">
      <v-card class="rounded-xl">
        <v-card-title class="card-title-center mb-7">แก้ไขรายละเอียดผู้ใช้</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="6" sm="5" class="pa-0 mr-4 ml-6">
                <v-text-field v-model="data.fname"
                  :rules="[(v) => !!v || 'โปรดกรอกชื่อ', (v) => /^[\u0E00-\u0E7F]+$/.test(v) || 'ชื่อต้องเป็นภาษาไทยเท่านั้น']"
                  label="ชื่อ" outlined required />
              </v-col>

              <v-col cols="6" sm="5" class="pa-0">
                <v-text-field v-model="data.lname"
                  :rules="[(v) => !!v || 'โปรดกรอกนามสกุล', (v) => /^[\u0E00-\u0E7F]+$/.test(v) || 'นามสกุลต้องเป็นภาษาไทยเท่านั้น']"
                  label="นามสกุล" outlined required />
              </v-col>

              <v-col cols="6" sm="5" class="pa-0 mr-4 ml-6">
                <v-text-field v-model="data.email"
                  :rules="[(v) => !!v || 'โปรดกรอกอีเมล', (v) => /.+@.+\..+/.test(v) || 'โปรดกรอกอีเมลที่ถูกต้อง']"
                  label="อีเมล" outlined required />
              </v-col>

              <v-col cols="6" sm="5" class="pa-0">
                <v-text-field v-model="data.phone"
                  :rules="[(v) => !!v || 'โปรดกรอกเบอร์โทรศัพท์', (v) => (v && v.length === 10) || 'เบอร์โทรศัพท์ต้องมี 10 หลัก', (v) => /^0/.test(v) || 'เบอร์โทรศัพท์ต้องมี 10 หลัก']"
                  label="เบอร์โทรศัพท์" outlined required />
              </v-col>

              <v-col cols="6" sm="5" class="pa-0 mr-4 ml-6">
                <v-select v-model="data.ranks_id" :items="rankOptions" :item-text="item => item.text"
                  :item-value="item => item.value" :rules="[(v) => !!v || 'โปรดเลือกตำแหน่ง']" label="ตำแหน่ง" outlined
                  required>
                  <template v-slot:item="data">
                    <v-icon left>
                      {{ data.item.icon }}
                    </v-icon>
                    {{ data.item.text }}
                  </template>
                </v-select>
              </v-col>

              <v-col cols="6" sm="5" class="pa-0">
                <v-select v-model="data.gender" :items="genderOptions" :item-text="item => item.text"
                  :item-value="item => item.value" :rules="[(v) => !!v || 'โปรดเลือกเพศ']" label="เพศ" outlined
                  required>
                  <template v-slot:item="data">
                    <v-icon left>
                      {{ data.item.icon }}
                    </v-icon>
                    {{ data.item.text }}
                  </template>
                </v-select>

              </v-col>
              <v-col cols="6" sm="5" class="pa-0 mr-4 ml-6">
                <v-select v-model="data.status" :items="statusOptions" :rules="[(v) => !!v || 'โปรดเลือกสถานะ']"
                  label="สถานะ" outlined required>
                  <template v-slot:item="data">
                    <v-icon left :style="{ color: data.item.color }">
                      {{ data.item.icon }}
                    </v-icon>
                    {{ data.item.text }}
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="card-title-center pa-0">
          <v-btn @click="confirm"
            :disabled="!valid || !data.fname || !data.lname || !data.phone || !data.email || !data.ranks_id || !data.status"
            depressed color="#24b224" class="font-weight-medium mr-2 mb-5">
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

      modal: {
        confirm: {
          open: false,
          message: 'ยืนยันการแก้ไขข้อมูล?',
        },
        complete: {
          open: false,
          message: 'แก้ไขข้อมูลสำเร็จ',
        },
        warning: {
          open: false,
          message: 'มีผู้ใช้งานอีเมลนี้แล้ว',
        },
      },

      valid: false,
      genderOptions: [],
      rankOptions: [],
      statusOptions: [],
      originalData: {},

    };
  },

  mounted() {
    this.setGenderOptions();
    this.setRankOptions();
    this.setStatusOptions();
    this.originalData = { ...this.data };
    document.addEventListener('keydown', this.handleKeydown);
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  },

  methods: {
    async setRankOptions() {
      try {
        this.ranks = await this.$store.dispatch('api/rank/getRanks');

        const rankIcons = {
          'ผู้พัฒนา': 'mdi-account-tie',
          'แอดมิน': 'mdi-account-hard-hat',
          'พนักงานทั่วไป': 'mdi-account'
        };

        const allRanks = this.ranks.map(rank => ({
          value: rank.no,
          text: rank.name,
          icon: rankIcons[rank.name] || 'mdi-account'
        }));

        const prioritizedRanks = ['ผู้พัฒนา', 'แอดมิน', 'พนักงานทั่วไป'];
        this.rankOptions = prioritizedRanks.reduce((acc, rankName) => {
          const rank = allRanks.find(r => r.text === rankName);
          if (rank) acc.push(rank);
          return acc;
        }, []).concat(allRanks.filter(r => !prioritizedRanks.includes(r.text)));

        if (this.data && this.data.ranks_id) {
          const selectedRank = this.rankOptions.find(r => r.value === this.data.ranks_id);
          this.rankOptions = selectedRank
            ? [selectedRank, ...this.rankOptions.filter(r => r.value !== this.data.ranks_id)]
            : this.rankOptions;
        }
      } catch (warning) {
      }
    },

    async confirm() {
      const currentRank = this.getRankName(this.$auth.user.ranks_id);
      const targetRank = this.getRankName(this.data.ranks_id);
      const isSelfEdit = this.$auth.user.email === this.data.email;

      if (currentRank === 'แอดมิน' && isSelfEdit) {
        this.modal.warning.open = true;
        this.modal.warning.message = 'ไม่สามารถแก้ไขตำแหน่งของตัวเองได้';
        return;
      }

      if (currentRank === 'ผู้พัฒนา' && targetRank === 'ผู้พัฒนา' && !isSelfEdit) {
        this.modal.warning.open = true;
        this.modal.warning.message = 'ไม่สามารถแก้ไขผู้ใช้งานที่มีตำแหน่งผู้พัฒนาได้';
        return;
      }

      if (currentRank === 'แอดมิน' && targetRank !== 'พนักงานทั่วไป' && !isSelfEdit) {
        this.modal.warning.open = true;
        this.modal.warning.message = 'ไม่สามารถแก้ไขผู้ใช้งานที่มีตำแหน่งผู้พัฒนาหรือแอดมินได้';
        return;
      }

      this.modal.confirm.open = true;
      await new Promise((resolve) => {
        this.$watch('modal.confirm.open', (newValue) => {
          if (!newValue) {
            resolve();
          }
        });
      });

      if (!this.modal.confirm.open) {
        return;
      }

      await this.updateData();
    }
    ,

    async updateData() {
      try {
        const req = await this.$store.dispatch('api/employee/updateEmployeeAll', this.data);
        this.modal.complete.open = true;
        this.recordLogUpdate();
      } catch (warning) {
        this.modal.warning.open = true;
      }
    },

    setGenderOptions() {
      const allGenders = [
        { text: 'ชาย', value: 'ชาย', icon: 'mdi-face-man' },
        { text: 'หญิง', value: 'หญิง', icon: 'mdi-face-woman' },
        { text: 'ไม่ระบุ', value: 'ไม่ระบุ', icon: 'mdi-not-equal-variant' }
      ];

      if (this.data && this.data.gender) {
        this.genderOptions = [
          { text: this.data.gender, value: this.data.gender, icon: this.getGenderIcon(this.data.gender) },
          ...allGenders.filter(g => g.value !== this.data.gender)
        ];
      } else {
        this.genderOptions = allGenders;
      }
    },

    getGenderIcon(gender) {
      switch (gender) {
        case 'ชาย':
          return 'mdi-face-man';
        case 'หญิง':
          return 'mdi-face-woman';
        case 'ไม่ระบุ':
          return 'mdi-not-equal-variant';
        default:
          return '';
      }
    },

    getRankName(rankId) {
      const rank = this.ranks.find(r => r.no === rankId);
      return rank ? rank.name : 'ไม่ทราบ';
    },

    setStatusOptions() {
      const allStatuses = [
        { value: 1, text: 'อนุมัติผู้ใช้งานแล้ว', color: '#24b224', icon: 'mdi-check-circle' },
        { value: 2, text: 'ยังไม่อนุมัติผู้ใช้งาน', color: '#e50211', icon: 'mdi-cancel' },
        { value: 3, text: 'รอการแก้ไขข้อมูลของผู้ใช้งาน', color: '#ffc800', icon: 'mdi-pencil' }
      ];

      if (this.data && this.data.status) {
        const selectedStatus = allStatuses.find(s => s.value === this.data.status);
        this.statusOptions = selectedStatus
          ? [selectedStatus, ...allStatuses.filter(s => s.value !== this.data.status)]
          : allStatuses;
      } else {
        this.statusOptions = allStatuses;
      }
    },

    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.cancel();
      }
    },

    cancel() {
      this.modal.confirm.open = false;
      this.$emit('update:edit', false);
    },

    goBack() {
      window.location.reload();
    },

    handleConfirmMethod() {
      this.modal.confirm.open = false;
      this.updateData();
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
      if (this.data.email !== this.originalData.email) {
        changes.push('EMAIL ' + this.data.email + '\n');
      }
      if (this.data.ranks_id !== this.originalData.ranks_id) {
        changes.push('RANK ' + this.data.ranks_id + '\n');
      }
      if (this.data.status !== this.originalData.status) {
        changes.push('STATUS ' + this.data.status + '\n');
      }

      const log = {
        emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
        emp_email: this.$auth.user.email,
        detail: changes.join(''),
        type: 4,
        picture: this.$auth.user.picture || 'Unknown',
        action: 'แก้ไขข้อมูลพนักงาน',
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      };
      this.$store.dispatch('api/log/addLogs', log);
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
