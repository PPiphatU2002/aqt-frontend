<template>
    <div>
        <EmployeeEditDialog :open="editDialog" :edit.sync="editDialog" :data="editData" />
        <EmployeeEditPassword :open="editPasswordDialog" :edit.sync="editPasswordDialog" :data="editPasswordData" />
        <EmployeeEditUpload :open="editUploadDialog" :edit.sync="editUploadDialog" :data="editUploadData" />

        <v-col v-for="employee in employees" :key="employee.no" cols="12">
            <v-card class="mx-auto my-12 rounded-xl text-center" max-width="400" hover>

                <v-img height="250" @click="
                    editUploadDialog = true
                editUploadData = employee
                    " :src="employee.picture
                        ? `http://localhost:3001/file/profile/${employee.picture}`
                        : 'http://localhost:3001/file/profile/person-icon.jpg'
                        ">
                </v-img>
                <v-card-title class="card-title-center">
                    {{ employee.fname + ' ' + employee.lname }}
                </v-card-title>
                <v-card-text>
                    <v-icon>mdi-email</v-icon> อีเมล : {{ employee.email }}
                    <br />
                    <v-icon>mdi-phone</v-icon> เบอร์โทรศัพท์ : {{ employee.phone }}
                    <br />
                    <v-icon>mdi-chair-rolling</v-icon> ตำแหน่ง : {{ getRankName(employee.ranks_id) }}
                    <br />
                    <v-icon>mdi-gender-male-female</v-icon> เพศ : {{ employee.gender }}
                    <br />
                    <v-icon>mdi-calendar</v-icon> วันที่สร้าง : {{ formatDateTime(employee.created_date) }}
                    <br />
                    <v-icon>mdi-calendar-clock</v-icon> อัพเดทล่าสุด : {{ formatDateTime(employee.updated_date) }}
                    <br />
                </v-card-text>

                <v-spacer></v-spacer>
                <v-card-actions class="card-title-center">
                    <v-btn color="#85d7df" @click="() => { editDialog = true; editData = employee }">
                        <v-icon left>mdi-pencil</v-icon>
                        แก้ไขข้อมูล
                    </v-btn>
                    <v-btn color="#24b224" @click="() => { editPasswordDialog = true; editPasswordData = employee }">
                        <v-icon left>mdi-lock</v-icon>
                        เปลี่ยนรหัสผ่าน
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </div>
</template>

<script>
import moment from 'moment'
moment.locale('th')

export default {
    layout: 'developer',
    middleware: 'auth',
    async mounted() {
        await this.checkRank()
        await this.fetchEmployeeData()
        await this.fetchRankData()
    },

    data() {
        return {
            employees: [],
            ranks: [],
            files: [],

            modal: {
                confirm: {
                    open: false,
                    message: '',
                },
                complete: {
                    open: false,
                    message: '',
                },
                error: {
                    open: false,
                    message: '',
                },
            },

            editDialog: false,
            editData: null,

            editPasswordDialog: false,
            editPasswordData: null,

            editUploadDialog: false,
            editUploadData: null,
        }
    },

    methods: {
        async checkRank() {
            if (this.$auth.loggedIn) {
                const Status = this.$auth.user.status.toString();
                const RankID = this.$auth.user.ranks_id.toString();
                if (Status === '2') {
                    this.$router.push('/');
                }
                else {
                    if (RankID === '1') {
                        console.log('Welcome Back Developer!');
                        this.$router.push('/developer/profile');
                    } else if (RankID === '2') {
                        console.log('Welcome Back Employee!');
                        this.$router.push('/employee/profile');
                    } else {
                        console.log('You Can Not Access This Page!');
                        this.$router.push('/auth');
                    }
                }
            } else {
                console.log('User Is Not Logged In!');
                this.$router.push('/auth');
            }
        },

        async fetchEmployeeData() {
            const empID = this.$auth.user.no
            this.employees = await this.$store.dispatch('api/employee/getEmployee', empID)
        },

        async fetchRankData() {
            this.ranks = await this.$store.dispatch('api/rank/getRanks')
        },

        async fetchFileData() {
            this.files = await this.$store.dispatch('api/file/viewProfile')
        },
        getRankName(rankId) {
            const rank = this.ranks.find(r => r.no === rankId);
            return rank ? rank.name : 'Unknown';
        },
        formatDateTime(date) {
            return moment(date).format('YYYY-MM-DD HH:mm');
        },

    },
}
</script>

<style scoped>
.card-title-center {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
</style>
