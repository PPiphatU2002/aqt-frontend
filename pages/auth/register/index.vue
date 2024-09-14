<template>
    <div @keyup.enter="register" class="register-container">
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <ModalConfirm :open="modal.confirm.open" :confirm.sync="modal.confirm.open" :method="create" />
        <v-container fluid fill-height class="d-flex align-center justify-center">
            <v-row align="center" justify="center">
                <v-col cols="12" sm="8" md="6">
                    <v-card>
                        <v-card-title style="justify-content: center; display: flex;">
                            <span class="headline">สร้างผู้ใช้งาน</span>
                        </v-card-title>
                        <v-card-subtitle class="pa-0"
                            style="justify-content: center; display: flex;">กรอกข้อมูลให้ครบถ้วน</v-card-subtitle>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-card-text class="pa-8">

                                <v-row class="pa-0">
                                    <v-col cols="12" class="pa-1">
                                        <v-text-field v-model="form.email" label="อีเมล" prepend-icon="mdi-email"
                                            type="email" outlined dense class="small-text-field"
                                            :rules="[rules.required, rules.email]"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="pa-0">
                                    <v-col cols="12" sm="6" class="pa-1">
                                        <v-text-field v-model="form.password" prepend-icon="mdi-lock" label="รหัสผ่าน"
                                            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                            :type="show1 ? 'text' : 'password'" @click:append="show1 = !show1" outlined
                                            dense class="small-text-field"
                                            :rules="[rules.required, rules.minPassword]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" class="pa-1">
                                        <v-text-field v-model="form.confirmPassword" prepend-icon="mdi-lock-check"
                                            label="ยืนยันรหัสผ่าน" :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                                            :type="show2 ? 'text' : 'password'" @click:append="show2 = !show2" outlined
                                            dense class="small-text-field"
                                            :rules="[rules.required, rules.passwordMatch]"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="pa-0">
                                    <v-col cols="12" sm="6" class="pa-1">
                                        <v-text-field v-model="form.fname" label="ชื่อ" prepend-icon="mdi-pen" outlined
                                            dense class="small-text-field"
                                            :rules="[rules.required, rules.thaiOnly]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" class="pa-1">
                                        <v-text-field v-model="form.lname" label="นามสกุล" prepend-icon="mdi-home-group"
                                            outlined dense class="small-text-field"
                                            :rules="[rules.required, rules.thaiOnly]"></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row class="pa-0">
                                    <v-col cols="12" sm="6" class="pa-1">
                                        <v-text-field v-model="form.phone" label="เบอร์โทรศัพท์"
                                            prepend-icon="mdi-phone" outlined dense class="small-text-field"
                                            :rules="[rules.required, rules.phoneNumber]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" class="pa-1">
                                        <v-select v-model="form.gender" :items="genderOptions" label="เพศ"
                                            prepend-icon="mdi-gender-male-female" outlined dense class="last-text-field"
                                            :rules="[rules.required]" ref="genderSelect">
                                            <template v-slot:item="data">
                                                <v-list-item :value="data.item.value"
                                                    @click="selectGender(data.item.value)">
                                                    <v-list-item-icon>
                                                        <v-icon>{{ data.item.icon }}</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title>{{ data.item.text }}</v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </template>
                                        </v-select>
                                    </v-col>
                                </v-row>

                                <v-row align="center" justify="center" class="pa-0">
                                    <v-col cols="6" class="pa-1 last-text-field">
                                        <v-btn :disabled="!valid" @click="confirm" color="#24b224" block>
                                            ลงทะเบียน
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="6" class="pa-1 last-text-field">
                                        <v-btn color="#e50211" @click="goBack" block>
                                            ยกเลิก
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-form>

                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import moment from 'moment';
moment.locale('th');

export default {
    layout: 'default',
    async mounted() {
        await this.checkRank();
    },

    data() {
        return {
            show1: false,
            show2: false,
            valid: false,
            form: {
                email: null,
                password: null,
                confirmPassword: null,
                fname: null,
                lname: null,
                phone: null,
                gender: null,
                picture: 'person-icon.jpg',
                status: 2,
                ranks_id: 2,
                created_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                updated_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            },

            modal: {
                confirm: { open: false, },
                complete: { open: false, message: 'การลงทะเบียนสมาชิกเสร็จสมบูรณ์ กรุณารอการอนุมัติผู้ใช้งาน' },
                error: { open: false, message: 'มีบางอย่างผิดปกติ' }
            },
            rules: {
                required: value => !!value || 'กรุณากรอกข้อมูล',
                email: value => /.+@.+\..+/.test(value) || 'กรุณากรอกอีเมลให้ถูกต้อง',
                minPassword: value => (value && value.length >= 8) || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร!',
                passwordMatch: value => value === this.form.password || 'รหัสผ่านต้องเหมือนกัน',
                phoneNumber: value => /^0[0-9]{9}$/.test(value) || 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง',
                thaiOnly: value => /^[ก-๙]+$/.test(value) || 'กรุณาใช้ชื่อเป็นภาษาไทย'
            },
            genderOptions: [
                { text: 'ชาย', value: 'ชาย', icon: 'mdi-face-man' },
                { text: 'หญิง', value: 'หญิง', icon: 'mdi-face-woman' },
                { text: 'ไม่ระบุ', value: 'ไม่ระบุ', icon: 'mdi-not-equal-variant' },
            ]
        };
    },
    methods: {
        async checkRank() {
            if (this.$auth.loggedIn) {
                const Status = this.$auth.user.status.toString();
                const RankID = this.$auth.user.ranks_id.toString();

                if (Status === '2') {
                    this.$router.push('/');
                    this.modal.warning.open = true;
                    await this.$auth.logout();
                }
                else {
                    if (RankID === '1') {
                        console.log('Welcome Back Developer!');
                        this.$router.push('/developer/home');
                    } else if (RankID === '2') {
                        console.log('Welcome Back Employee!');
                        this.$router.push('/employee/home');
                    } else {
                        console.log('You Can Not Access This Page!');
                        this.$router.push('/auth');
                    }
                }

            } else {
                console.log('User Is Not Logged In!');
                this.$router.push('/auth/register');
            }
        },

        async confirm() {
            if (this.$refs.form.validate()) {
                try {
                    this.modal.confirm.open = true
                } catch (error) {
                    this.modal.error.open = true
                }
            } else {
                this.modal.error.open = true;
                this.modal.error.message = "กรุณากรอกข้อมูลให้ครบถ้วน";
            }
        },
        async create() {
            try {
                const req = await this.$store.dispatch('api/employee/register', this.form)
                this.recordLog()
                this.modal.complete.open = true
            } catch (error) {
                this.modal.error.open = true
                this.modal.error.message = "มีอีเมลนี้อยู่แล้ว";
            }
        },
        recordLog() {
            const log = {
                emp_name: this.form.fname + ' ' + this.form.lname,
                emp_email: this.form.email,
                picture: 'person-icon.jpg',
                type: 4,
                detail: 'PHONE ' + this.form.phone
                    + '\nGENDER ' + this.form.gender,
                action: 'ส่งคำร้องขอสมัครสมาชิก',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            }
            console.log(log);

            this.$store.dispatch('api/log/addLogs', log);
        },

        goBack() {
            this.$router.push('/auth')
        },

        resetForm() {
            this.form.email = null;
            this.form.password = null;
            this.form.confirmPassword = null;
            this.form.fname = null;
            this.form.lname = null;
            this.form.phone = null;
            this.form.gender = null;

            // Reset form validation
            this.$refs.form.resetValidation();
        },

        selectGender(gender) {
            this.form.gender = gender;
            this.$nextTick(() => {
                this.$refs.genderSelect.blur();
            });
        }
    }
};
</script>

<style scoped>
.register-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80vh;
}

.v-card {
    max-width: 600px;
    max-height: 800px;
    margin: auto;
}

.last-text-field {
    margin-bottom: 2px;
}
</style>
