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
              <v-col cols="6" sm="5" class="pa-0 mr-8 ml-4">
                <v-text-field v-model="formData.id" :rules="[(v) => /^(AQT)?[0-9]{9}$/.test(v) || 'กรุณากรอกข้อมูลให้ถูกต้อง'
                ]" label="ไอดีลูกค้า" outlined required maxlength="12" />
              </v-col>

              <v-col cols="6" sm="5" class="pa-0">
                <v-text-field v-model="formData.nickname"
                  :rules="[(v) => !!v || 'โปรดกรอกชื่อเล่นลูกค้า', (v) => /^[\u0E00-\u0E7F]+$/.test(v) || 'ต้องเป็นภาษาไทยเท่านั้น']"
                  label="ชื่อเล่น" outlined required />
              </v-col>

              <v-col cols="6" sm="5" class="pa-0 mr-8 ml-4">
                <v-select v-model="formData.type_id" :items="typeOptions" :item-text="item => item.text"
                  :item-value="item => item.value" :rules="[(v) => !!v || 'โปรดเลือกประเภท']" label="ประเภท" outlined
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
                <v-select v-model="formData.base_id" :items="baseOptions" :item-text="item => item.text"
                  :item-value="item => item.value" :rules="[(v) => !!v || 'โปรดเลือกฐานทุน']" label="ฐานทุน" outlined
                  required>
                  <template v-slot:item="data">
                    <v-icon left>
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
          <v-btn @click="confirm" :disabled="!valid || !formData.id || !formData.nickname" depressed
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
          message: 'มีลูกค้าไอดีนี้แล้ว',
        },
      },

      formData: { ...this.data },
      valid: false,
      typeOptions: [],
      baseOptions: [],
      originalData: {},

    };
  },

  mounted() {
    this.setTypeOptions();
    this.setBaseOptions();
    this.formData = { ...this.data };
    this.originalData = { ...this.data };
    document.addEventListener('keydown', this.handleKeydown);
  },

  watch: {
    data(newData) {
      this.formData = { ...newData };
    },
    deep: true,
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  },

  methods: {
    async setBaseOptions() {
      try {
        this.bases = await this.$store.dispatch('api/base/getBases');

        const baseIcons = {
          'มีเงิน': 'mdi-cash-100',
          'รอจังหวะ': 'mdi-timer-sand',
          'รอคุย': 'mdi-phone-in-talk',
        };

        const allBases = this.bases.map(base => ({
          value: base.no,
          text: base.base,
          icon: baseIcons[base.base] || 'mdi-cash'
        }));

        const prioritizedBases = ['มีเงิน', 'รอจังหวะ','รอคุย'];
        this.baseOptions = prioritizedBases.reduce((acc, baseName) => {
          const base = allBases.find(r => r.text === baseName);
          if (base) acc.push(base);
          return acc;
        }, []).concat(allBases.filter(r => !prioritizedBases.includes(r.text)));

        if (this.data && this.data.base_id) {
          const selectedBase = this.baseOptions.find(r => r.value === this.data.base_id);
          this.baseOptions = selectedBase
            ? [selectedBase, ...this.baseOptions.filter(r => r.value !== this.data.base_id)]
            : this.baseOptions;
        }
      } catch (warning) {
      }
    },

    async setTypeOptions() {
      try {
        this.types = await this.$store.dispatch('api/type/getTypes');

        const typeIcons = {
          'เทรดเอง': 'mdi-account-tie-hat',
          'เทรดตามโค้ช': 'mdi-account-cowboy-hat',
        };

        const allTypes = this.types.map(type => ({
          value: type.no,
          text: type.type,
          icon: typeIcons[type.type] || 'mdi-cash'
        }));

        const prioritizedTypes = ['เทรดเอง', 'เทรดตามโค้ช'];
        this.typeOptions = prioritizedTypes.reduce((acc, typeName) => {
          const type = allTypes.find(r => r.text === typeName);
          if (type) acc.push(type);
          return acc;
        }, []).concat(allTypes.filter(r => !prioritizedTypes.includes(r.text)));

        if (this.data && this.data.type_id) {
          const selectedType = this.typeOptions.find(r => r.value === this.data.type_id);
          this.typeOptions = selectedType
            ? [selectedType, ...this.typeOptions.filter(r => r.value !== this.data.type_id)]
            : this.typeOptions;
        }
      } catch (warning) {
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
        return;
      }

      await this.updateData();
    },

    async updateData() {
      try {
        this.formData.emp_id = this.$auth.user.no;
        const req = await this.$store.dispatch('api/customer/updateCustomer', this.formData);
        this.modal.complete.open = true;
        this.data = { ...this.formData };
        this.recordLogUpdate();
      } catch (warning) {
        this.modal.warning.open = true;
      }
    },

    getTypeName(typeId) {
      const type = this.types.find(t => t.no === typeId);
      return type ? type.type : 'ไม่ทราบ';
    },

    getBaseName(baseId) {
      const base = this.bases.find(b => b.no === baseId);
      return base ? base.base : 'ไม่ทราบ';
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
      if (this.data.id !== this.originalData.id) {
        changes.push('ID ' + this.data.id + '\n');
      }
      if (this.data.nickname !== this.originalData.nickname) {
        changes.push('NICKNAME ' + this.data.nickname + '\n');
      }

      const typeText = this.getTypeName(this.data.type_id);
      const originalTypeText = this.getTypeName(this.originalData.type_id);
      if (typeText !== originalTypeText) {
        changes.push('TYPE ' + typeText + '\n');
      }

      const baseText = this.getBaseName(this.data.base_id);
      const originalBaseText = this.getBaseName(this.originalData.base_id);
      if (baseText !== originalBaseText) {
        changes.push('BASE ' + baseText + '\n');
      }

      const log = {
        emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
        emp_email: this.$auth.user.email,
        detail: changes.join(''),
        type: 3,
        picture: this.$auth.user.picture || 'Unknown',
        action: 'แก้ไขข้อมูลลูกค้า',
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
