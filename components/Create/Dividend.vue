<template>
    <v-dialog v-model="isOpen" @close="updateOpen(false)" max-width="400" max-height="300">
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <ModalConfirm :open="modal.confirm.open" :confirm.sync="modal.confirm.open" :method="submitForm" />

        <v-card class="custom-card" flat>
            <v-card-title class="d-flex align-center justify-center mb-3">
                <v-icon class="little-icon" color="#24b224">mdi-basket-plus</v-icon>&nbsp;
                <h3 class="mb-0">เพิ่มจำนวนปันผล</h3>
            </v-card-title>

            <v-form ref="form" v-model="isFormValid" lazy-validation>
                <v-container>
                    <v-row>
                        <v-col cols="5" sm="11" class="ml-4 mr-4 mt-2 pa-0">
                            <v-menu ref="datePickerMenu" v-model="datePickerMenu" :close-on-content-click="false"
                                transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="selectedDate" label="วันที่" readonly v-bind="attrs"
                                        v-on="on" :rules="[(v) => !!v || 'กรุณาเลือกวันที่']" outlined dense>
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="selectedDate" @input="datePickerMenu = false"
                                    locale="th"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="5" sm="5" class="pa-0 ml-4">
                            <v-autocomplete v-model="stock_id" :items="stocks" item-text="name" item-value="no"
                                label="ชื่อหุ้น" dense outlined :rules="[(v) => !!v || 'กรุณากรอกชื่อหุ้น']" clearable>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="5" sm="5" class="pa-0 mr-4 ml-8">
                            <v-text-field v-model="newStockType" label="จำนวนปันผล" dense outlined
                                :rules="[(v) => !!v || 'กรุณากรอกจำนวนปันผล']" required>
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" class="text-center pa-0">
                            <v-btn @click="confirm" :disabled="!isFormValid" color="#24b224" class="mb-5">
                                ยืนยัน
                            </v-btn>
                            <v-btn @click="cancel" color="#e50211" class="ml-2 mb-5">
                                ยกเลิก
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card>
    </v-dialog>
</template>

<script>
import moment from 'moment';

export default {
    props: {
        open: {
            type: Boolean,
            required: true,
        },
    },

    async mounted() {
        await this.fetchStockData()
    },

    data() {
        return {
            stock_id: '',
            stocks: [],
            newStockType: '',
            isOpen: this.open,
            isFormValid: false,
            selectedDate: '', // ตัวแปรเก็บวันที่ที่เลือก
            datePickerMenu: false,
            modal: {
                complete: { open: false, message: '' },
                error: { open: false, message: '' },
                confirm: { open: false, message: '' },
            },
        };
    },
    watch: {
        open(newVal) {
            this.isOpen = newVal;
        }
    },

    mounted() {
        this.fetchStockData();
        window.addEventListener('keydown', this.handleKeydown);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeydown);
    },

    methods: {
        async fetchStockData() {
            try {
                const response = await this.$store.dispatch('api/stock/getStocks');
                if (response) {
                    this.stocks = response.map(item => ({ no: item.no, name: item.name }));
                }
            } catch (error) {
                console.error('Error fetching stocks:', error);
            }
        },
        handleKeydown(event) {
            if (event.key === 'Escape') {
                this.cancel();
            }
        },
        updateOpen(val) {
            this.isOpen = val;
            this.$emit('update:open', val);
        },
        goBack() {
            window.location.reload();
        },

        async submitForm() {
            if (this.newStockType.trim() === '') {
                this.modal.error.message = 'กรุณากรอกชื่อประเภทหุ้น';
                this.modal.error.open = true;
                return;
            }
            try {
                const emp_id = this.$auth.user.no;
                const updated_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                const response = await this.$store.dispatch('api/dividend/addDividend', {
                    stock_id: this.stock_id,
                    dividend: this.newStockType,
                    emp_id,
                    created_date: this.selectedDate,
                    updated_date,
                });

                this.modal.complete.message = 'เพิ่มประเภทหุ้นสำเร็จ';
                this.modal.complete.open = true;
                this.recordLog();
                this.stock_id = '';
                this.selectedDate = '';
                this.newStockType = '';
                this.$emit('update:open', false);
            } catch (error) {
                this.modal.error.message = 'มีชื่อประเภทหุ้นนี้แล้ว';
                this.modal.error.open = true;
            }
        },
        async confirm() {
            try {
                this.modal.confirm.open = true;
            } catch (error) {
                this.modal.error.open = true;
            }
        },
        cancel() {
            this.newStockType = '';
            this.$emit('update:open', false);
        },
        recordLog() {
            const log = {
                stock_id: this.newStockType,
                emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
                emp_email: this.$auth.user.email,
                detail: 'ไม่มีข้อมูลเพิ่มเติม',
                type: 2,
                picture: this.$auth.user.picture || 'Unknown',
                action: 'เพิ่มประเภทหุ้นใหม่',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };
            this.$store.dispatch('api/log/addLogs', log);
        },
    },
};
</script>

<style scoped>
.custom-container {
    overflow-y: hidden;
    overflow-x: hidden;
    padding-top: 6px;
    /* หรือค่าที่ต้องการ */
    padding-bottom: 6px;
}
</style>