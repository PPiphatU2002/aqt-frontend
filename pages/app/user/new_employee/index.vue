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
                        <div class="d-flex align-center mt-2 justify-center">
                            <div class="d-flex align-center mt-2 justify-center">
                                <v-icon class="small-icon" @click="toggleSavedSearchesDialog">
                                    mdi-format-list-bulleted-type
                                </v-icon>
                                <span>{{ savedSearches.length }}</span>
                            </div>

                            <v-dialog v-model="showSavedSearchesDialog" max-width="400px">
                                <v-card>
                                    <v-card-title class="headline"
                                        style="justify-content: center; display: flex;">บันทึกการค้นหา</v-card-title>
                                    <v-card-text>
                                        <v-list>
                                            <v-list-item-group v-if="savedSearches.length > 0">
                                                <v-list-item v-for="(search, index) in savedSearches" :key="index">
                                                    <v-list-item-content>
                                                        <v-list-item-title>
                                                            <strong>ประเภท :</strong>
                                                            {{ getSearchTypeText(search.type) }}
                                                        </v-list-item-title>
                                                        <v-list-item-subtitle v-if="search.query">
                                                            <strong>รายละเอียด :</strong> {{ search.query }}
                                                        </v-list-item-subtitle>
                                                        <v-list-item-subtitle v-if="search.start && search.end">
                                                            <strong>ระยะเวลา :</strong> {{
                                                                formatDateTime(search.start)
                                                            }} - {{ formatDateTime(search.end) }}
                                                        </v-list-item-subtitle>
                                                        <v-list-item-subtitle v-if="search.topics">
                                                            <strong>หัวข้อ :</strong> {{ search.topics.join(', ') }}
                                                        </v-list-item-subtitle>
                                                    </v-list-item-content>
                                                    <v-list-item-action>
                                                        <v-btn icon @click="deleteSearch(index)">
                                                            <v-icon color=#e50211>mdi-delete</v-icon>
                                                        </v-btn>
                                                    </v-list-item-action>
                                                </v-list-item>
                                            </v-list-item-group>
                                            <v-list-item v-else>
                                                <v-list-item-content style="justify-content: center; display: flex;">
                                                    <v-icon color=#e50211>mdi-alert-circle</v-icon>
                                                    ไม่มีข้อมูลการค้นหา</v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="#e50211" @click="showSavedSearchesDialog = false">ปิด</v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                            <v-select v-model="searchType" :items="searchTypes" dense outlined
                                class="mx-2 search-size small-font" @change="onSearchTypeChange"></v-select>

                            <v-autocomplete v-if="searchType !== 'status' && searchType !== 'updated_date'"
                                v-model="searchQuery" :items="getSearchItems(searchType)" label="ค้นหา" dense outlined
                                append-icon="mdi-magnify" class="mx-2 same-size small-font" hide-no-data
                                hide-details></v-autocomplete>

                            <v-select v-if="searchType === 'status'" v-model="selectedTopics" :items="actionTopics"
                                dense outlined multiple class="mx-2 search-size small-font"></v-select>


                            <v-menu v-if="searchType === 'updated_date'" v-model="datePickerMenu"
                                :close-on-content-click="false" transition="scale-transition" offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on" class="date-picker-activator">
                                        <v-icon class="small-label">mdi-calendar-start-outline</v-icon>
                                        <date-picker v-model="startDateTime" format="YYYY-MM-DD HH:mm"
                                            type="datetime" />
                                    </div>
                                </template>
                            </v-menu>

                            <v-menu v-if="searchType === 'updated_date'" v-model="endDatePickerMenu"
                                :close-on-content-click="false" transition="scale-transition" offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on" class="date-picker-activator ml-2">
                                        <v-icon class="small-label">mdi-calendar-end-outline</v-icon>
                                        <date-picker v-model="endDateTime" format="YYYY-MM-DD HH:mm" type="datetime" />
                                    </div>
                                </template>
                            </v-menu>

                            <v-btn icon @click="addSearch">
                                <v-icon class="small-icon ">mdi-plus</v-icon>
                            </v-btn>
                        </div>
                    </v-col>
                </v-row>
            </v-container>

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

            searchQuery: '',
            searchType: 'fname',
            currentAction: '',
            selectedItemDetail: '',
            startDateTime: '',
            endDateTime: '',
            sortBy: 'updated_date',
            modalConfirmOpen: false,
            dialog: false,
            isSearchFieldVisible: false,
            datePickerMenu: false,
            endDatePickerMenu: false,
            showSavedSearchesDialog: false,
            showColumnSelector: false,
            sortDesc: true,
            currentItem: null,
            employeeNo: null,
            actionType: null,
            employees: [],
            selectedTopics: [],
            savedSearches: [],
            visibleColumns: ['updated_date', 'picture', 'status', 'email', 'fname', 'lname', 'phone', 'gender', 'detail'],

            searchQueries: {
                'fname': [],
                'email': [],
                'phone': [],
            },

            searchTypes: [
                { text: 'ชื่อ-นามสกุล', value: 'fname' },
                { text: 'อีเมล', value: 'email' },
                { text: 'เบอร์โทรศัพท์', value: 'phone' },
                { text: 'เวลา', value: 'updated_date' }
            ],

            actionTopics: [
                { text: 'รอการยืนยันผู้ใช้งาน', value: 'รอการยืนยันผู้ใช้งาน' },
            ],

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
                    text: 'ชื่อ-นามสกุล',
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
            let filteredEmployees = this.employees;
            this.savedSearches.forEach(search => {
                filteredEmployees = filteredEmployees.filter(employee => {
                    return this.applySearchFilter(employee, search);
                });
            });
            return filteredEmployees;
        },

        formattedDetailLines() {
            return this.selectedItemDetail.split('\n');
        },

        filteredHeaders() {
            return this.headers.filter(header => this.visibleColumns.includes(header.value));
        },
    },

    methods: {
        onImageError(event, item) {
            event.target.src = `http://localhost:3001/file/default/${item.picture}`;
        },
        getSearchItems(type) {
            if (type === 'fname') {
                return this.employees.map(emp => `${emp.fname} ${emp.lname}`);
            } else if (type === 'email') {
                return this.employees.map(emp => emp.email);
            } else if (type === 'phone') {
                return this.employees.map(emp => emp.phone);
            }
            return [];
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
                const status3 = await this.$store.dispatch('api/employee/getEmployeesStatus', '3');
                const statusMap = {
                    2: 'รอการยืนยันผู้ใช้งาน',
                };
                this.employees = [...status2, ...status3].map(employee => {
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

        openDetail(item) {
            this.selectedItemDetail = item.detail;
            this.dialog = true;
        },

        onSearchTypeChange() {
            this.isSearchFieldVisible = this.searchType !== 'updated_date' && this.searchType !== 'status';
        },

        validateDateRange() {
            const start = moment(this.startDateTime);
            const end = moment(this.endDateTime);

            if (start.isValid() && end.isValid() && start.isAfter(end)) {
                this.modal.error.open = true;
                return false;
            }
            return true;
        },

        addSearch() {
            if (!this.validateDateRange()) {
                return;
            }

            if (this.searchType === 'status') {
                this.addTopicToSearch();
            } else if (this.searchType === 'fname' || this.searchType === 'email' || this.searchType === 'phone') {
                this.addTextToSearch();
            } else {
                this.savedSearches.push({
                    query: this.searchQuery,
                    type: this.searchType,
                    topic: this.selectedTopic,
                    start: this.startDateTime,
                    end: this.endDateTime
                });
                this.searchQuery = '';
                this.selectedTopic = '';
                this.startDateTime = '';
                this.endDateTime = '';
            }
        },

        addTextToSearch() {
            const trimmedQuery = this.searchQuery.trim();
            if (trimmedQuery) {
                this.searchQueries[this.searchType].push(trimmedQuery);
                this.savedSearches.push({
                    query: this.searchQueries[this.searchType],
                    type: this.searchType,
                    start: this.startDateTime,
                    end: this.endDateTime
                });
                this.searchQuery = '';
            }
        },

        addTopicToSearch() {
            this.savedSearches.push({
                query: '',
                type: 'status',
                topics: [...this.selectedTopics],
                start: this.startDateTime,
                end: this.endDateTime
            });
            this.selectedTopics = [];
            this.startDateTime = '';
            this.endDateTime = '';
        },

        applySearchFilter(employee, search) {
            const field = employee[search.type] ? employee[search.type].toLowerCase() : '';
            let queryMatched = true;
            if (search.type === 'email' || search.type === 'phone') {
                queryMatched = this.searchQueries[search.type].some(query =>
                    field.includes(query.toLowerCase())
                );
            } else if (search.type === 'fname') {
                const field = `${employee.fname} ${employee.lname}`.toLowerCase();
                queryMatched = this.searchQueries[search.type].some(query =>
                    field.includes(query.toLowerCase())
                );
            } else {
                const searchQuery = search.query.toLowerCase();
                queryMatched = field.includes(searchQuery);
            }
            const timeMatched = search.type === 'updated_date' ? this.checkTimeRange(employee, search) : true;
            const topicMatched = search.topics ? search.topics.some(topic => topic === employee.status) : true;
            return queryMatched && timeMatched && topicMatched;
        },

        checkTimeRange(employee, search) {
            const employeeTime = moment(employee.updated_date);
            const startTime = moment(search.start);
            const endTime = moment(search.end);
            return (!startTime.isValid() || employeeTime.isSameOrAfter(startTime)) &&
                (!endTime.isValid() || employeeTime.isSameOrBefore(endTime));
        },

        toggleSavedSearchesDialog() {
            this.showSavedSearchesDialog = !this.showSavedSearchesDialog;
        },

        deleteSearch(index) {
            this.savedSearches.splice(index, 1);
        },

        getSearchTypeText(type) {
            const found = this.searchTypes.find(item => item.value === type);
            return found ? found.text : type;
        },

        maskNewData(data) {
            if (!data) return '';
            const length = data.length;
            if (length <= 4) return data;
            const firstPart = data.slice(0, 1);
            const lastPart = data.slice(-1);
            const maskedPart = '*'.repeat(length - 4)
            return `${firstPart}${maskedPart}${lastPart}`;
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
.small-font {
    font-size: 0.8rem;
}

::v-deep .v-select-list .v-list-item__title {
    font-size: 0.8rem;
}

::v-deep .v-label {
    font-size: 0.8rem;
}

.small-label {
    margin-right: 8px;
}

.small-icon {
    font-size: 1.5rem;
    margin-right: 6px;
    margin-left: 6px;
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

.date-picker-activator {
    display: flex;
    align-items: center;
}

.ml-2 {
    margin-left: 8px;
}

.mx-2 {
    margin-left: 8px;
    margin-right: 8px;
}


.mt-2 {
    margin-top: 1px;
}

.d-flex {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
}

.same-size {
    max-width: 200px;
    max-height: 40px;
}

.search-size {
    max-width: 200px;
    max-height: 40px;
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

::v-deep .v-text-field.small-font .v-input__control .v-input__label {
    font-size: 0.8rem !important;
}

.v-menu__content {
    top: 100%;
    left: 0;
    margin-top: 0px;
    margin-bottom: 0px;
}

.custom-list-item {
    padding: 0 0;
}

.v-list-item__content {
    padding: 0;
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

.v-list-item__content {
    display: flex;
    align-items: center;
}

.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
}

.image-container img {
    max-width: 100%;
    max-height: 60px;
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

.custom-card {
    max-width: 1200px;
    width: 100%;
    margin: auto;
}
</style>