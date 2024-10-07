<template>
    <v-dialog v-model="open" max-width="300px">
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <ModalConfirm :open="modal.confirm.open" :confirm.sync="modal.confirm.open" :method="submitForm" />

        <v-card class="custom-card" flat>
            <v-card-title class="d-flex align-center justify-center mb-3">
                <v-icon class="little-icon" color="#24b224">mdi-archive-plus</v-icon>&nbsp;
                <h3 class="mb-0">เพิ่มประเภทหุ้น</h3>
            </v-card-title>

            <v-form ref="form" v-model="isFormValid" lazy-validation>
                <v-container>
                    <v-row>
                        <v-col cols="5" sm="11" class="pa-0 ml-3">
                            <v-text-field v-model="newStockType" label="ชื่อประเภทหุ้น" required outlined>
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
    data() {
        return {
            newStockType: '',
            isFormValid: false,
            modal: {
                complete: { open: false, message: '' },
                error: { open: false, message: '' },
                confirm: { open: false, message: '' },
            },
        };
    },
    methods: {
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
                const created_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                const updated_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                const response = await this.$store.dispatch('api/set/addSet', {
                    set: this.newStockType,
                    emp_id,
                    created_date,
                    updated_date,
                });

                this.modal.complete.message = 'เพิ่มประเภทหุ้นสำเร็จ';
                this.modal.complete.open = true;
                this.newStockType = '';
                this.$emit('update:open', false);
            } catch (error) {
                this.modal.error.message = 'มีชื่อประเภทหุ้นนี้แล้ว';
                this.modal.error.open = true;
            }
        },
        async confirm() {
            try {
                this.modal.confirm.open = true
            } catch (error) {
                this.modal.error.open = true
            }
        },
        cancel() {
            this.newStockType = '';
            this.$emit('update:open', false);
        },
    },
};
</script>
