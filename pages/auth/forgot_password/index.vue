<template>
    <div @keyup.enter="submitData" class="forgot-password-container">
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <ModalRecheck :open="modal.recheck.open" @confirm="handleRecheckConfirm"
            @update:open="val => modal.recheck.open = val" />
        <ModalVerify :open="modal.verify.open" @confirm="handleVerifyConfirm"
            @update:open="val => modal.verify.open = val" :expectedEmail="expectedEmail" />
        <v-container fluid fill-height class="d-flex align-center justify-center">
            <v-row align="center" justify="center">
                <v-col cols="12" sm="8" md="6">
                    <v-card>
                        <v-card-title style="justify-content: center; display: flex;">
                            <span class="headline">ลืมรหัสผ่าน</span>
                        </v-card-title>
                        <v-card-subtitle style="justify-content: center; display: flex;">
                            เลือกวิธีค้นหาข้อมูลของคุณ
                        </v-card-subtitle>
                        <v-card-text>
                            <v-radio-group v-model="selectedMethod" column>
                                <v-radio label="อีเมล" value="email"></v-radio>
                                <v-radio label="เบอร์โทรศัพท์" value="phone"></v-radio>
                            </v-radio-group>

                            <v-text-field v-if="selectedMethod === 'email'" v-model="form.email" label="อีเมล"
                                prepend-icon="mdi-email" type="email" outlined dense
                                class="small-text-field"></v-text-field>

                            <v-text-field v-if="selectedMethod === 'phone'" v-model="form.phone" label="เบอร์โทรศัพท์"
                                prepend-icon="mdi-phone" type="tel" outlined dense
                                class="small-text-field"></v-text-field>

                            <v-btn @click="submitData" :disabled="!form.email && !form.phone" color="#24b224" block>
                                ค้นหา
                            </v-btn>
                            <a @click="goToLogin" class="go-to-login-text">
                                กลับไปที่หน้าเข้าสู่ระบบ
                            </a>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>

export default {
    layout: 'default',
    data() {
        return {
            selectedMethod: 'email',
            form: {
                email: '',
                phone: '',
            },
            modal: {
                error: {
                    open: false,
                    message: '',
                },
                recheck: {
                    open: false,
                },
                verify: {
                    open: false,
                },
            },
            expectedEmail: ''
        };
    },
    methods: {
        async submitData() {
            try {
                let response = null;

                if (this.selectedMethod === 'email') {
                    response = await this.$store.dispatch('api/employee/getEmployeeEmail', this.form.email);
                    console.log(response)
                    this.expectedEmail = this.form.email;
                } else if (this.selectedMethod === 'phone') {
                    response = await this.$store.dispatch('api/employee/getEmployeePhone', this.form.phone);
                    console.log(response)
                    this.expectedEmail = '';
                }

                if (response && Array.isArray(response) && response.length > 0) {
                    this.modal.recheck.open = true;
                } else {
                    this.modal.error.message = this.selectedMethod === 'email'
                        ? 'ไม่พบข้อมูลที่ตรงกับอีเมลนี้'
                        : 'ไม่พบข้อมูลที่ตรงกับเบอร์โทรศัพท์นี้';
                    this.modal.error.open = true;
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
                this.modal.error.message = this.selectedMethod === 'email'
                    ? 'เกิดข้อผิดพลาดในการค้นหาอีเมล'
                    : 'เกิดข้อผิดพลาดในการค้นหาเบอร์โทรศัพท์';
                this.modal.error.open = true;
            }
        },
        goToLogin() {
            this.$router.push('/auth');
        },
        handleRecheckConfirm() {
            this.modal.recheck.open = false;
            this.modal.verify.open = true;
        },
        handleVerifyConfirm(additionalInfo) {
            // คุณสามารถจัดการข้อมูลเพิ่มเติมที่กรอกได้ที่นี่
            if (additionalInfo === this.expectedEmail) {
                console.log('ข้อมูลถูกต้อง');
                this.$router.push('/auth/reset_password'); // เปลี่ยนเส้นทางไปที่หน้าตั้งรหัสผ่านใหม่
            } else {
                console.log('ข้อมูลไม่ถูกต้อง');
            }
        }
    },
};
</script>

<style scoped>
.forgot-password-container {
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

.go-to-login-text {
    font-size: 0.85rem;
    color: #24b224;
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