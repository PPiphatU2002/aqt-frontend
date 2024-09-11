<template>
    <div>
        <v-card flat>
            <v-container>
                <v-row justify="center" align="center">
                    <v-col cols="auto">
                        <v-card-title class="d-flex align-center justify-center">
                            <v-icon class="little-icon">mdi-home-clock-outline</v-icon>&nbsp;
                            <h3 class="mb-0">EMPLOYEE HISTORY</h3>
                        </v-card-title>
                        <div class="d-flex align-center mt-2 justify-center">
                            <v-icon class="small-icon">mdi-format-list-bulleted-type</v-icon>
                            <v-select v-model="searchType" :items="searchTypes" dense outlined class="mx-2 search-size small-font"
                                @change="onSearchTypeChange"></v-select>

                            <v-text-field v-if="isSearchFieldVisible" v-model="searchQuery" label="SEARCH" dense outlined
                                append-icon="mdi-magnify" class="mx-2 same-size small-font"></v-text-field>

                            <v-select v-if="searchType === 'action'" v-model="selectedTopic" :items="actionTopics" dense outlined
                                class="mx-2 search-size small-font">
                            </v-select>

                            <v-menu v-if="searchType === 'time'" v-model="datePickerMenu" :close-on-content-click="false"
                                transition="scale-transition" offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on" class="date-picker-activator">
                                        <v-icon class="small-label">mdi-calendar-start-outline</v-icon>
                                        <date-picker v-model="startDateTime" format="YYYY-MM-DD HH:mm" type="datetime" />
                                    </div>
                                </template>
                            </v-menu>

                            <v-menu v-if="searchType === 'time'" v-model="endDatePickerMenu" :close-on-content-click="false"
                                transition="scale-transition" offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on" class="date-picker-activator ml-2">
                                        <v-icon class="small-label">mdi-calendar-end-outline</v-icon>
                                        <date-picker v-model="endDateTime" format="YYYY-MM-DD HH:mm" type="datetime" />
                                    </div>
                                </template>
                            </v-menu>
                        </div>
                    </v-col>
                </v-row>
            </v-container>

            <v-data-table :headers="headers" :items="filtered" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                item-key="id" :items-per-page="5">
                <template v-slot:item.avatar="{ item }">
                    <v-avatar size="40">
                        <img :src="`http://localhost:3001/files/avatar/${getUserAvatar(item.user_id)}`" alt="avatar" />
                    </v-avatar>
                </template>
                <template v-slot:item.user_email="{ item }">
                    <div class="text-center">{{ item.emp_email }}</div>
                </template>
                <template v-slot:item.user_name="{ item }">
                    <div class="text-center">{{ item.emp_name }}</div>
                </template>
                <template v-slot:item.action="{ item }">
                    <div class="text-center"
                         :style="{ color: getActionColor(item.action) }">
                        {{ item.action }}
                    </div>
                </template>
                <template v-slot:item.detail="{ item }">
                    <div class="text-center">
                        <v-icon @click="openDetail(item)" color="#85d7df">mdi-eye</v-icon>
                    </div>
                </template>
                <template v-slot:item.time="{ item }">
                    <div class="text-center">{{ formatDateTime(item.time) }}</div>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="dialog" max-width="300px">
            <v-card>
                <v-card-title class="headline">DETAIL</v-card-title>
                <v-card-text>
                    <div v-for="line in formattedDetailLines" :key="line">
                        <template v-if="line.includes('NAME')">
                            <v-icon color="white">mdi-pen</v-icon>
                            {{ line.replace('NAME', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('PHONE')">
                            <v-icon color="green">mdi-phone</v-icon>
                            {{ line.replace('PHONE', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('GENDER')">
                            <v-icon color="blue">mdi-gender-male-female</v-icon>
                            {{ line.replace('GENDER', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('LOCATION')">
                            <v-icon color="red">mdi-map-marker</v-icon>
                            {{ line.replace('LOCATION', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('IP')">
                            <v-icon color="blue">mdi-ip</v-icon>
                            {{ line.replace('IP', '').trim() }}
                        </template>
                        <template v-else>
                            {{ line }}
                        </template>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="dialog = false">ปิด</v-btn>
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

export default {
    layout: 'developer',
    middleware: 'auth',
    async mounted() {
        await this.checkRole();
        await this.fetchLogData();
        await this.fetchUserData();
    },

    components: {
        DatePicker,
    },

    data() {
        return {
            logs: [],
            users: [],
            searchQuery: '',
            searchType: 'action',
            selectedTopic: '',
            searchTypes: [
                { text: 'NAME', value: 'emp_name' },
                { text: 'E-MAIL', value: 'emp_email' },
                { text: 'ACTION', value: 'action' },
                { text: 'TIME', value: 'time' }
            ],
            actionTopics: [
                { text: 'LOGIN', value: 'LOGIN' },
                { text: 'LOGOUT', value: 'LOGOUT' },
                { text: 'REQUEST TO REGISTER', value: 'REQUEST TO REGISTER' },
            ],
            sortBy: 'time',
            sortDesc: true,
            dialog: false,
            selectedItemDetail: '',
            isSearchFieldVisible: false,
            datePickerMenu: false,
            endDatePickerMenu: false,
            startDateTime: '',
            endDateTime: '',

            headers: [
                {
                    text: 'TIME',
                    value: 'time',
                    align: 'center',
                    cellClass: 'text-center',
                },
                {
                    text: 'PROFILE',
                    value: 'avatar',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },
                {
                    text: 'ACTION',
                    value: 'action',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },
                {
                    text: 'E-MAIL',
                    value: 'user_email',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },
                {
                    text: 'NAME',
                    value: 'user_name',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },
                {
                    text: 'DETAIL',
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
            const query = (this.searchQuery || '').toLowerCase();
            const start = this.startDateTime ? moment(this.startDateTime, 'YYYY-MM-DD HH:mm').startOf('minute') : null;
            const end = this.endDateTime ? moment(this.endDateTime, 'YYYY-MM-DD HH:mm').endOf('minute') : null;

            return this.logs.filter(log => {
                const field = log[this.searchType] ? log[this.searchType].toLowerCase() : '';
                const logDate = moment(log.time);

                const isQueryMatched = field.includes(query) ||
                    moment(log.time).format('YYYY-MM-DD HH:mm').includes(query);

                let isTimeMatched = true;
                if (this.searchType === 'time') {
                    if (start && end) {
                        isTimeMatched = logDate.isBetween(start, end, null, '[]');
                    } else if (start) {
                        isTimeMatched = logDate.isSameOrAfter(start);
                    } else if (end) {
                        isTimeMatched = logDate.isSameOrBefore(end);
                    }
                }

                const isActionMatched = this.searchType === 'action' && this.selectedTopic
                    ? log.action === this.selectedTopic
                    : true;

                return isQueryMatched && isTimeMatched && isActionMatched;
            });
        },

        formattedDetailLines() {
            return this.selectedItemDetail.split('\n');
        },
    },

    methods: {
        async checkRole() {
            if (this.$auth.loggedIn) {
                const roleId = this.$auth.user.ranks_id.toString();
                if (roleId === '1') {
                    this.$router.push('/developer/history/employee');
                } else if (roleId === '2') {
                    this.$router.push('/it/log');
                } else {
                    this.$router.push('/auth');
                }
            } else {
                this.$router.push('/developer/history/employee');
            }
        },

        async fetchLogData() {
            this.logs = await this.$store.dispatch('api/log/getLogsType', '4');
        },

        async fetchUserData() {
            this.users = await this.$store.dispatch('api/employee/getEmployees');
        },

        getUserEmail(userId) {
            const user = this.users.find(user => user.no === userId);
            return user ? user.email : 'N/A';
        },

        getUserAvatar(userId) {
            const user = this.users.find(user => user.id === userId);
            return user ? user.avatar : 'person-icon.jpg';
        },

        getActionColor(action) {
            if (action === 'LOGOUT') {
                return '#e50211'; // สีสำหรับ LOGOUT
            } else if (action === 'LOGIN') {
                return '#24b224'; // สีสำหรับ LOGIN
            } else {
                return 'inherit'; // สีเริ่มต้นสำหรับค่าอื่นๆ
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

        exportExcel() {
            const userLogs = this.logs.map(log => ({
                'อีเมล': this.getUserEmail(log.user_id),
                'การจัดการ': log.action,
                'เวลา': moment(log.time).format('LLL'),
            }));
            const worksheet = XLSX.utils.json_to_sheet(userLogs);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'User Logs');
            XLSX.writeFile(workbook, 'user-logs.xlsx');
        },

        onSearchTypeChange() {
            if (this.searchType === 'emp_email' || this.searchType === 'emp_name') {
                this.isSearchFieldVisible = true;
            } else {
                this.isSearchFieldVisible = false;
            }
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
</style>