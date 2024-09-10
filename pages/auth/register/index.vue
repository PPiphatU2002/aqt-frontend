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
                        <v-card-title>
                            <span class="headline">CREATE YOUR ACCOUNT</span>
                        </v-card-title>
                        <v-card-subtitle>REGISTER BELOW</v-card-subtitle>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-card-text>
                                <v-text-field v-model="form.email" label="E-MAIL" prepend-icon="mdi-email" type="email"
                                    outlined dense class="small-text-field"
                                    :rules="[rules.required, rules.email]"></v-text-field>

                                <v-text-field v-model="form.password" prepend-icon="mdi-lock" label="PASSWORD"
                                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :type="show1 ? 'text' : 'password'"
                                    @click:append="show1 = !show1" outlined dense class="small-text-field"
                                    :rules="[rules.required, rules.minPassword]"></v-text-field>

                                <v-text-field v-model="form.confirmPassword" prepend-icon="mdi-lock-check"
                                    label="CONFIRM PASSWORD" :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                                    :type="show2 ? 'text' : 'password'" @click:append="show2 = !show2" outlined dense
                                    class="small-text-field"
                                    :rules="[rules.required, rules.passwordMatch]"></v-text-field>

                                <v-text-field v-model="form.fname" label="NAME" prepend-icon="mdi-face-woman-profile"
                                    outlined dense class="small-text-field"
                                    :rules="[rules.required, rules.englishOnly]"></v-text-field>

                                <v-text-field v-model="form.lname" label="SURNAME" prepend-icon="mdi-face-man-profile"
                                    outlined dense class="small-text-field"
                                    :rules="[rules.required, rules.englishOnly]"></v-text-field>

                                <v-text-field v-model="form.phone" label="TELEPHONE NUMBER" prepend-icon="mdi-phone"
                                    outlined dense class="last-text-field"
                                    :rules="[rules.required, rules.phoneNumber]"></v-text-field>

                                <v-row align="center" justify="center">
                                    <v-col cols="6">
                                        <v-btn :disabled="!valid" @click="confirm" color="primary" block>
                                            REGISTER
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="6">
                                        <v-btn color="error" @click="goBack" block>
                                            CANCEL
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
                status: 2,
                ranks_id: 2,
                created_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                updated_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            },

            modal: {
                confirm: { open: false, },
                complete: { open: false, message: 'MEMBERSHIP REGISTRATION COMPLETED, PLEASE WAIT FOR USER APPROVAL!' },
                error: { open: false, message: 'SOMETHING WAS WRONG!' }
            },
            rules: {
                required: value => !!value || 'FIELD IS REQUIRED!',
                email: value => /.+@.+\..+/.test(value) || 'E-MAIL MUST BE VALID!',
                minPassword: value => (value && value.length >= 8) || 'PASSWORD MUST BE ATLEAST 8 CHARACTERS!',
                passwordMatch: value => value === this.form.password || 'PASSWORD MUST MATCH!',
                phoneNumber: value => /^0[0-9]{9}$/.test(value) || 'TELEPHONE NUMBER MUST BE 10 DIGITS!',
                englishOnly: value => /^[a-zA-Z]+$/.test(value) || 'ONLY ENGLISH LETTERS ARE ALLOWED!'
            }
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
                this.modal.error.message = "PLEASE FILL IN ALL INFORMATION COMPLETELY!";
            }
        },
        async create() {
            try {
                const req = await this.$store.dispatch('api/employee/register', this.form)
                this.recordLog()
                this.modal.complete.open = true
            } catch (error) {
                this.modal.error.open = true
                this.modal.error.message = "E-MAIL ALREADY EXISTS!";
            }
        },
        recordLog() {
            const log = {
                emp_email: this.form.email,
                type:4,
                detail: 'NAME : '+this.form.fname+'\nSURNAME : '+this.form.lname
                +'\nTELEPHONE NUMBER : '+this.form.phone,
                action: 'REQUEST TO REGISTER',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            }
            console.log(log);

            this.$store.dispatch('api/log/addLogs', log);
        },

        goBack() {
            this.$router.push('/auth')
        },
    }
};
</script>

<style scoped>
.register-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 85vh;
}

.v-card {
    max-width: 600px;
    max-height: 600px;
    margin: auto;
}

.last-text-field {
    margin-bottom: 6px;
}
</style>