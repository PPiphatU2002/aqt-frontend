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
        <v-card-title class="card-title-center mb-7">แก้ไขรายละเอียดหุ้น</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>

              <v-col cols="6" sm="5" class="pa-0 mr-8 ml-4">
                <v-autocomplete v-model="formData.customer_id" :items="customers" :item-text="item => item.text"
                  :item-value="item => item.value" :rules="[(v) => !!v || 'โปรดกรอกรหัสสมาชิก']" label="รหัสสมาชิก"
                  outlined clearable solo hide-no-data hide-details />
              </v-col>

              <v-col cols="6" sm="5" class="pa-0">
                <v-menu ref="menu" v-model="menu" :close-on-content-click="false" :nudge-right="40"
                  :return-value.sync="formData.created_date" transition="scale-transition" offset-y min-width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="formattedCreatedDate" label="วันที่" outlined readonly v-bind="attrs"
                      v-on="on" :rules="[(v) => !!v || 'โปรดเลือกวันที่']"></v-text-field>
                  </template>
                  <v-date-picker v-model="formData.created_date" no-title scrollable @input="onDateSelected"
                    :locale="'th'" :first-day-of-week="1"></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="6" sm="5" class="pa-0 mr-8 ml-4">
                <v-autocomplete v-model="formData.stock_id" :items="stocks" :item-text="item => item.text"
                  :item-value="item => item.value" :rules="[(v) => !!v || 'โปรดกรอกชื่อหุ้น']" label="ชื่อหุ้น" outlined
                  clearable solo hide-no-data hide-details />
              </v-col>

              <v-col cols="6" sm="5" class="pa-0">
                <v-select v-model="formData.from_id" :items="fromOptions" :item-text="item => item.text"
                  :item-value="item => item.value" :rules="[(v) => !!v || 'โปรดเลือกที่มาที่ไป']" label="ที่มาที่ไป"
                  outlined required>
                  <template v-slot:item="data">
                    <v-icon left>
                      {{ data.item.icon }}
                    </v-icon>
                    {{ data.item.text }}
                  </template>
                </v-select>
              </v-col>

              <v-col cols="6" sm="5" class="pa-0 mr-8 ml-4">
                <v-text-field v-model="formData.price" :rules="[
                  (v) => !!v || 'โปรดกรอกราคาที่ติด',
                  (v) => /^[0-9]*\.?[0-9]+$/.test(v) || 'กรุณากรอกตัวเลข'
                ]" label="ราคาที่ติด" outlined required />
              </v-col>

              <v-col cols="6" sm="5" class="pa-0">
                <v-text-field v-model="formData.amount" :rules="[
                  (v) => !!v || 'โปรดกรอกจำนวนที่ติด',
                  (v) => /^[0-9]*\.?[0-9]+$/.test(v) || 'กรุณากรอกตัวเลข'
                ]" label="จำนวนที่ติด" outlined required />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="card-title-center pa-0">
          <v-btn @click="confirm"
            :disabled="!valid || !hasChanges || !formData.customer_id || !formData.stock_id || !formData.price || !formData.amount || !formData.from_id"
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
import Decimal from 'decimal.js';

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
          message: 'มีหุ้นชื่อนี้แล้ว',
        },
      },
      menu: false,
      formData: { ...this.data },
      valid: false,
      fromOptions: [],
      originalData: {},
      customers: [],
      stocks: [],

    };
  },

  computed: {
    hasChanges() {
      return JSON.stringify(this.formData) !== JSON.stringify(this.originalData);
    },
  },

  async mounted() {
    await this.fetchStockData()
  },

  mounted() {
    this.fetchCustomerData();
    this.fetchStockData();
    this.setFromOptions();

    this.formData = JSON.parse(JSON.stringify(this.data));
    this.originalData = JSON.parse(JSON.stringify(this.data));
    if (moment(this.formData.created_date).isValid()) {
      this.formattedCreatedDate = moment(this.formData.created_date).format('YYYY-MM-DD');
    } else {
      this.formattedCreatedDate = '';
    }
    document.addEventListener('keydown', this.handleKeydown);
  },

  watch: {
    data: {
      handler(newData) {
        this.formData = JSON.parse(JSON.stringify(newData));
        this.originalData = JSON.parse(JSON.stringify(newData));
        if (moment(this.formData.created_date).isValid()) {
          this.formattedCreatedDate = moment(this.formData.created_date).format('YYYY-MM-DD');
        } else {
          this.formattedCreatedDate = '';
        }
      },
      deep: true,
      immediate: true
    },
    formData: {
      handler(newFormData) {
        if (newFormData.stock_id) {
          this.fetchStockData();
        }
      },
      deep: true,
    }
  },


  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  },

  methods: {
    onDateSelected(date) {
      if (moment(date).isValid()) {
        this.formData.created_date = date;
        this.formattedCreatedDate = moment(date).format('YYYY-MM-DD');
      } else {
        this.formData.created_date = null;
        this.formattedCreatedDate = '';
      }
      this.menu = false;
    },

    async fetchCustomerData() {
      try {
        this.customers = await this.$store.dispatch('api/customer/getCustomers');
        this.customers = this.customers.map(customer => ({
          value: customer.no,
          text: customer.id,
        }));

        if (this.data && this.data.customer_id) {
          const selectedType = this.customers.find(r => r.value === this.data.customer_id);
          this.customers = selectedType
            ? [selectedType, ...this.customers.filter(r => r.value !== this.data.customer_id)]
            : this.customers;
        }
      } catch (warning) {
        console.error(warning);
      }
    },

    async fetchStockData() {
      try {
        const fetchedStocks = await this.$store.dispatch('api/stock/getStocks');
        this.stocks = fetchedStocks.map(stock => ({
          value: stock.no,
          text: stock.name,
          closing_price: stock.closing_price,
        }));

        if (this.formData && this.formData.stock_id) {
          const selectedType = this.stocks.find(r => r.value === this.formData.stock_id);
          if (selectedType) {
            this.formData.closing_price = selectedType.closing_price;
          }
          this.stocks = selectedType
            ? [selectedType, ...this.stocks.filter(r => r.value !== this.formData.stock_id)]
            : this.stocks;
        }
      } catch (warning) {
        console.error(warning);
      }
    },

    async setFromOptions() {
      try {
        this.froms = await this.$store.dispatch('api/from/getFroms');

        const fromIcons = {
          'หุ้นเก่า': 'mdi-numeric-1',
          'หุ้นใหม่': 'mdi-numeric-2',
          'หุ้นแก้เกม': 'mdi-numeric-3',
        };

        const allTypes = this.froms.map(from => ({
          value: from.no,
          text: from.from,
          icon: fromIcons[from.from] || 'mdi-currency-usd'
        }));

        const prioritizedTypes = ['หุ้นเก่า', 'หุ้นใหม่', 'หุ้นแก้เกม'];
        this.fromOptions = prioritizedTypes.reduce((acc, fromName) => {
          const from = allTypes.find(r => r.text === fromName);
          if (from) acc.push(from);
          return acc;
        }, []).concat(allTypes.filter(r => !prioritizedTypes.includes(r.text)));

        if (this.data && this.data.from_id) {
          const selectedType = this.fromOptions.find(r => r.value === this.data.from_id);
          this.fromOptions = selectedType
            ? [selectedType, ...this.fromOptions.filter(r => r.value !== this.data.from_id)]
            : this.fromOptions;
        }
      } catch (warning) {
      }
    },

    getFromName(fromId) {
      const from = this.froms.find(f => f.no === fromId);
      return from ? from.from : 'ไม่ทราบ';
    },

    getStockName(stockID) {
      const stock = this.stocks.find(s => s.value === stockID);
      return stock ? stock.text : 'ไม่ทราบ';
    },

    getCustomerID(customerId) {
      const customer = this.customers.find(c => c.value === customerId);
      return customer ? customer.text : 'ไม่ทราบ';
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
        this.formData.created_date = this.formattedCreatedDate
        const req = await this.$store.dispatch('api/detail/updateDetail', this.formData);
        this.modal.complete.open = true;
        this.data = { ...this.formData };
        this.recordLogUpdate();
      } catch (warning) {
        this.modal.warning.open = true;
        this.modal.warning.message = 'มีบางอย่างผิดปกติ';
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
      const StockText = this.getStockName(this.formData.stock_id);
      const originalStockText = this.getStockName(this.originalData.stock_id);
      if (StockText !== originalStockText) {
        changes.push('ชื่อหุ้น : ' + StockText + '\n');
      }

      const fromText = this.getFromName(this.formData.from_id);
      const originalfromText = this.getFromName(this.originalData.from_id);
      if (fromText !== originalfromText) {
        changes.push('ที่มาที่ไป : ' + fromText + '\n');
      }

      if (this.formData.price !== this.originalData.price) {
        changes.push('ราคาที่ติด : ' + this.formData.price + '\n');
      }

      if (this.formData.amount !== this.originalData.amount) {
        changes.push('จำนวนที่ติด : ' + this.formData.amount + '\n');
      }

      const log = {
        customer_id: this.getCustomerID(this.originalData.customer_id),
        emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
        emp_email: this.$auth.user.email,
        detail: changes.join(''),
        type: 1,
        picture: this.$auth.user.picture || 'ไม่รู้จัก',
        action: 'แก้ไขข้อมูลหุ้นของลูกค้า',
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