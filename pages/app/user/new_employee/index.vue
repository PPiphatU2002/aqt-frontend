<template>

    <div>
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <ModalConfirm :method="handleConfirm" :open="modalConfirmOpen" @update:confirm="modalConfirmOpen = false" />
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />

        <v-card class="custom-card" flat>
            <v-container>
                <v-row justify="center" align="center">
                    <v-col cols="auto">
                        <v-card-title class="d-flex align-center justify-center">
                            <v-icon class="little-icon" color="#24b224">mdi-home-plus</v-icon>&nbsp;
                            <h3 class="mb-0">คำร้องขอสมัครสมาชิก</h3>
                        </v-card-title>
                    </v-col>
                </v-row>
            </v-container>

            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <v-menu v-model="showColumnSelector" offset-y offset-x :close-on-content-click="false">
                    <template v-slot:activator="{ on }">
                        <v-icon v-on="on" class="tab-icon" style="font-size: 2rem;"
                            color="#85d7df">mdi-playlist-check</v-icon>
                    </template>
                    <v-list class="header-list">
                        <v-list-item v-for="header in headers.filter(header => header.value !== 'detail')"
                            :key="header.value" class="header-item">
                            <v-list-item-content>
                                <v-checkbox v-model="visibleColumns" :value="header.value" :label="header.text" />
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>

            <v-data-table :headers="filteredHeaders" :items="filtered" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                item-key="no" :items-per-page="5">
                <template v-slot:item.picture="{ item }">
                    <v-avatar size="40">
                        <img :src="`http://localhost:3001/file/profile/${item.picture}`"
                            @error="onImageError($event, item)" alt="picture" />
                    </v-avatar>
                </template>
                <template v-slot:item.email="{ item }">
                    <div class="text-center">{{ item.email }}</div>
                </template>
                <template v-slot:item.fname="{ item }">
                    <div class="text-center">{{ item.fname + ' ' + item.lname }}</div>
                </template>
                <template v-slot:item.phone="{ item }">
                    <div class="text-center">{{ item.phone }}</div>
                </template>
                <template v-slot:item.gender="{ item }">
                    <div class="text-center">{{ item.gender }}</div>
                </template>
                <template v-slot:item.status="{ item }">
                    <span :style="{ color: getStatusText(item.status).color }">
                        {{ getStatusText(item.status).text }}
                    </span>
                </template>
                <template v-slot:item.updated_date="{ item }">
                    <div class="text-center">{{ formatDateTime(item.updated_date) }}</div>
                </template>
                <template v-slot:item.detail="{ item }">
                    <div class="text-center">
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon v-bind="attrs" v-on="on" color="#85d7df">mdi-dots-vertical</v-icon>
                            </template>
                            <v-list class="custom-list">
                                <v-list-item @click="showConfirmDialog('approve', item)" class="custom-list-item">
                                    <v-list-item-icon style="margin-right: 4px;">
                                        <v-icon class="icon-tab" color="#24b224">mdi-check-circle</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content style="font-size: 0.8rem;">อนุมัติ</v-list-item-content>
                                </v-list-item>

                                <v-list-item @click="showConfirmDialog('reject', item)" class="custom-list-item">
                                    <v-list-item-icon style="margin-right: 4px;">
                                        <v-icon class="icon-tab" color="#e50211">mdi-cancel</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content style="font-size: 0.8rem;">ไม่อนุมัติ</v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </template>
            </v-data-table>
            <div class="text-center">
                <v-btn class = "mb-4" color="#e50211" @click="goToEmpManagement">
                    ย้อนกลับ
                </v-btn>
            </div>
        </v-card>

        <v-dialog v-model="dialog" max-width="300px">
            <v-card>
                <v-card-title class="headline"
                    style="justify-content: center; display: flex;">รายละเอียดเพิ่มเติม</v-card-title>
                <v-card-text>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#e50211" @click="dialog = false">ปิด</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

import * as XLSX from 'xlsx';
import moment from 'moment';
import 'moment/locale/th'
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import Papa from 'papaparse';

export default {

    layout: 'user',
    middleware: 'auth',

    async mounted() {
        await this.checkRank();
        await this.fetchEmployeeData();
    },

    components: {
        DatePicker,
    },

    data() {
        return {
            modal: {
                error: {
                    open: false,
                    message: 'การป้อนข้อมูลเวลาไม่ถูกต้อง',
                },
                confirm: {
                    open: false,
                },
                complete: {
                    open: false,
                    message: 'สำเร็จ',
                },
            },

            sortBy: 'updated_date',
            modalConfirmOpen: false,
            dialog: false,
            showColumnSelector: false,
            sortDesc: true,
            currentItem: null,
            employees: [],
            visibleColumns: ['updated_date', 'picture', 'status', 'email', 'fname', 'lname', 'phone', 'gender', 'detail'],

            headers: [
                {
                    text: 'เวลา',
                    value: 'updated_date',
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'โปรไฟล์',
                    value: 'picture',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'สถานะ',
                    value: 'status',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'อีเมล',
                    value: 'email',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'เบอร์โทรศัพท์',
                    value: 'phone',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ชื่อ',
                    value: 'fname',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'เพศ',
                    value: 'gender',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: '',
                    value: 'detail',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },
            ],
        };
    },

    computed: {
        filtered() {
            return this.employees;
        },

        filteredHeaders() {
            return this.headers.filter(header => this.visibleColumns.includes(header.value));
        },
    },

    methods: {
        onImageError(event, item) {
            event.target.src = `http://localhost:3001/file/default/${item.picture}`;
        },

        showConfirmDialog(action, item) {
            this.currentAction = action;
            this.currentItem = item;
            this.modalConfirmOpen = true;
        },
        
        async handleConfirm() {
            try {
                if (this.currentAction === 'approve') {
                    await this.$store.dispatch('api/employee/updateEmployeeStatus', {
                        no: this.currentItem.no,
                        status: 1,
                        emp_id: this.$auth.user.no
                    });
                    this.recordLog();
                    this.modal.complete.message = 'อนุมัติผู้ใช้งานเรียบร้อยแล้ว';
                } else if (this.currentAction === 'reject') {
                    await this.$store.dispatch('api/employee/deleteEmployee', this.currentItem.no);
                    this.modal.complete.message = 'ลบผู้ใช้งานนี้เรียบร้อยแล้ว';
                    this.recordLog();
                }

                this.modal.complete.open = true;
            } catch (error) {
                this.modal.complete.message = 'เกิดข้อผิดพลาดในการดำเนินการ';
                this.modal.complete.open = true;
            }

            this.modalConfirmOpen = false;
        },

        async checkRank() {
            if (this.$auth.loggedIn) {
                const Status = this.$auth.user.status.toString();
                const RankID = this.$auth.user.ranks_id.toString();
                if (Status === '2') {
                    this.$router.push('/');
                    await this.$auth.logout();
                }
                else {
                    if (RankID === '1') {
                        this.$router.push('/app/user/new_employee');
                    } else if (RankID === '2') {
                        this.$router.push('/app/home');
                    } else if (RankID === '3') {
                        this.$router.push('/app/user/new_employee');
                    } else {
                        this.$router.push('/auth');
                    }
                }
            } else {
                this.$router.push('/');
            }
        },

        getStatusText(status) {
            if (status === 'รอการยืนยันผู้ใช้งาน') {
                return { text: 'รอการยืนยันผู้ใช้งาน', color: '#e50211' };
            } else {
                return { text: 'สถานะไม่ทราบ', color: 'inherit' };
            }
        },

        async fetchEmployeeData() {
            try {
                const status2 = await this.$store.dispatch('api/employee/getEmployeesStatus', '2');
                const statusMap = {
                    2: 'รอการยืนยันผู้ใช้งาน',
                };
                this.employees = [...status2].map(employee => {
                    return {
                        ...employee,
                        status: statusMap[employee.status] || 'สถานะไม่ทราบ'
                    };
                });
            } catch (error) {
            }
        },

        formatDateTime(date) {
            if (moment(date).isValid()) {
                return moment(date).format('YYYY-MM-DD HH:mm');
            }
            return 'Invalid Date';
        },

        goBack() {
            window.location.reload();
        },

        recordLog() {
            const log = {
                emp_id: this.currentItem.fname+' '+this.currentItem.lname,
                emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
                emp_email: this.$auth.user.email,
                detail: this.currentAction === 'approve'
                    ? `อีเมล : ${this.currentItem.email}\nเบอร์โทรศัพท์ : ${this.currentItem.phone}\nเพศ : ${this.currentItem.gender}`
                    : `อีเมล : ${this.currentItem.email}\nเบอร์โทรศัพท์ : ${this.currentItem.phone}\nเพศ : ${this.currentItem.gender}`,
                type: 4,
                picture: this.$auth.user.picture || 'Unknown',
                action: this.currentAction === 'approve'
                    ? 'อนุมัติผู้ใช้งาน'
                    : 'ไม่อนุมัติผู้ใช้งาน',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };
            this.$store.dispatch('api/log/addLogs', log);
        },

        goToEmpManagement() {
            this.$router.push('/app/user/employee_management');
        },
    },
};

</script>

<style scoped>
.custom-card {
    max-width: 1200px;
    width: 100%;
    margin: auto;
}

.v-data-table th,
.v-data-table td {
    padding: 8px;
    text-align: center;
}

.v-card-title {
    display: flex;
    align-items: center;
}

.header-list {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    gap: 0px;
}

.header-item {
    flex: 1 0 0%;
    box-sizing: border-box;
}

.tab-icon {
    cursor: pointer;
    margin-right: 6px;
    margin-left: 24px;
}

.little-icon {
    font-size: 3rem;
    margin-right: 8px;
    margin-left: 8px;
}

.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
}

.icon-tab {
    font-size: 120% !important;
}

.custom-list-item {
    padding: 0.1px 8px;
}

.custom-list {
    padding: 0.4px 2px;
}
</style>
