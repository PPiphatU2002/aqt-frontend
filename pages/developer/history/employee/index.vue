<template>
    <div>
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <v-card flat>
            <v-container>
                <v-row justify="center" align="center">
                    <v-col cols="auto">
                        <v-card-title class="d-flex align-center justify-center">
                            <v-icon class="little-icon">mdi-home-clock-outline</v-icon>&nbsp;
                            <h3 class="mb-0">EMPLOYEE HISTORY</h3>
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
                                    <v-card-title class="headline" style="justify-content: center; display: flex;">SAVED
                                        SEARCHES</v-card-title>
                                    <v-card-text>
                                        <v-list>
                                            <v-list-item-group v-if="savedSearches.length > 0">
                                                <v-list-item v-for="(search, index) in savedSearches" :key="index">
                                                    <v-list-item-content>
                                                        <v-list-item-title>
                                                            <strong>TYPE :</strong> {{ search.type }}
                                                        </v-list-item-title>
                                                        <v-list-item-subtitle>
                                                            <strong>QUERY :</strong> {{ search.query }}
                                                        </v-list-item-subtitle>
                                                        <v-list-item-subtitle v-if="search.start && search.end">
                                                            <strong>TIME RANGE :</strong> {{
                                                                formatDateTime(search.start)
                                                            }} - {{ formatDateTime(search.end) }}
                                                        </v-list-item-subtitle>
                                                        <v-list-item-subtitle v-if="search.topics">
                                                            <strong>TOPICS :</strong> {{ search.topics.join(', ') }}
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
                                                    NO SAVED SEARCHES AVAILABLE!</v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="#e50211" @click="showSavedSearchesDialog = false">Close</v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                            <v-select v-model="searchType" :items="searchTypes" dense outlined
                                class="mx-2 search-size small-font" @change="onSearchTypeChange"></v-select>

                            <v-text-field v-if="searchType !== 'action' && searchType !== 'time'" v-model="searchQuery"
                                label="SEARCH" dense outlined append-icon="mdi-magnify"
                                class="mx-2 same-size small-font">
                            </v-text-field>

                            <v-select v-if="searchType === 'action'" v-model="selectedTopics" :items="actionTopics"
                                dense outlined multiple class="mx-2 search-size small-font"></v-select>


                            <v-menu v-if="searchType === 'time'" v-model="datePickerMenu"
                                :close-on-content-click="false" transition="scale-transition" offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <div v-bind="attrs" v-on="on" class="date-picker-activator">
                                        <v-icon class="small-label">mdi-calendar-start-outline</v-icon>
                                        <date-picker v-model="startDateTime" format="YYYY-MM-DD HH:mm"
                                            type="datetime" />
                                    </div>
                                </template>
                            </v-menu>

                            <v-menu v-if="searchType === 'time'" v-model="endDatePickerMenu"
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
                    <v-list-item v-for="header in headers" :key="header.value" class="header-item">
                        <v-list-item-content>
                            <v-checkbox v-model="visibleColumns" :value="header.value" :label="header.text" />
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>


            <v-data-table :headers="filteredHeaders" :items="filtered" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                item-key="id" :items-per-page="5">
                <template v-slot:item.picture="{ item }">
                    <v-avatar size="40">
                        <img :src="`http://localhost:3001/files/profile/${item.picture}`" alt="picture" />
                    </v-avatar>
                </template>
                <template v-slot:item.emp_email="{ item }">
                    <div class="text-center">{{ item.emp_email }}</div>
                </template>
                <template v-slot:item.emp_name="{ item }">
                    <div class="text-center">{{ item.emp_name }}</div>
                </template>
                <template v-slot:item.action="{ item }">
                    <div class="text-center" :style="{ color: getActionColor(item.action) }">
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
                <v-card-title class="headline" style="justify-content: center; display: flex;">DETAIL</v-card-title>
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
                    <v-btn color="#e50211" @click="dialog = false">CLOSE</v-btn>
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

export default {
    layout: 'developer',
    middleware: 'auth',
    async mounted() {
        await this.checkRole();
        await this.fetchLogData();
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
                    message: 'DATE ENTRY HAS AN ERROR!',
                },
            },

            logs: [],
            employees: [],
            searchQuery: '',
            searchType: '',
            selectedTopics: [],
            savedSearches: [],
            searchQueries: {
                'emp_name': [],
                'emp_email': [],
            },
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
            showSavedSearchesDialog: false,

            showColumnSelector: false,
            visibleColumns: ['time', 'picture', 'action', 'emp_email', 'emp_name', 'detail'],
            headers: [
                {
                    text: 'TIME',
                    value: 'time',
                    align: 'center',
                    cellClass: 'text-center',
                },
                {
                    text: 'PROFILE',
                    value: 'picture',
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
                    value: 'emp_email',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },
                {
                    text: 'NAME',
                    value: 'emp_name',
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
            let filteredLogs = this.logs;
            this.savedSearches.forEach(search => {
                filteredLogs = filteredLogs.filter(log => {
                    return this.applySearchFilter(log, search);
                });
            });

            return filteredLogs;
        },

        formattedDetailLines() {
            return this.selectedItemDetail.split('\n');
        },

        filteredHeaders() {
            return this.headers.filter(header => this.visibleColumns.includes(header.value));
        },
    },

    methods: {
        async checkRole() {
            if (this.$auth.loggedIn) {
                const roleId = this.$auth.user.ranks_id.toString();
                if (roleId === '1') {
                    this.$router.push('/developer/history/employee');
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

        async fetchEmployeeData() {
            this.employees = await this.$store.dispatch('api/employee/getEmployees');
        },

        getEmployeeProfile(employeeID) {
            const employee = this.employees.find(employee => employee.no === employeeID);
            const picture = employee ? employee.picture : 'person-icon.jpg';
            console.log(`Employee ID: ${employeeID}, Picture: ${picture}`);
            return picture;
        },

        getActionColor(action) {
            if (action === 'LOGOUT') {
                return '#e50211';
            } else if (action === 'LOGIN') {
                return '#24b224';
            } else {
                return 'inherit';
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
                'อีเมล': this.getUserEmail(log.emp_id),
                'การจัดการ': log.action,
                'เวลา': moment(log.time).format('LLL'),
            }));
            const worksheet = XLSX.utils.json_to_sheet(userLogs);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'User Logs');
            XLSX.writeFile(workbook, 'user-logs.xlsx');
        },

        onSearchTypeChange() {
            this.isSearchFieldVisible = this.searchType !== 'time' && this.searchType !== 'action';
        }
        ,

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

            if (this.searchType === 'action') {
                this.addTopicToSearch();
            } else if (this.searchType === 'emp_name' || this.searchType === 'emp_email') {
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
                type: 'action',
                topics: [...this.selectedTopics],
                start: this.startDateTime,
                end: this.endDateTime
            });
            this.selectedTopics = [];
            this.startDateTime = '';
            this.endDateTime = '';
        },

        applySearchFilter(log, search) {
            const field = log[search.type] ? log[search.type].toLowerCase() : '';
            let queryMatched = true;

            if (search.type === 'emp_name' || search.type === 'emp_email') {
                queryMatched = this.searchQueries[search.type].some(query =>
                    field.includes(query.toLowerCase())
                );
            } else {
                const searchQuery = search.query.toLowerCase();
                queryMatched = field.includes(searchQuery);
            }

            const timeMatched = search.type === 'time' ? this.checkTimeRange(log, search) : true;
            const topicMatched = search.topics ? search.topics.some(topic => topic === log.action) : true;
            return queryMatched && timeMatched && topicMatched;
        },

        checkTimeRange(log, search) {
            const logTime = moment(log.time);
            const startTime = moment(search.start);
            const endTime = moment(search.end);
            return (!startTime.isValid() || logTime.isSameOrAfter(startTime)) &&
                (!endTime.isValid() || logTime.isSameOrBefore(endTime));
        },

        toggleSavedSearchesDialog() {
            this.showSavedSearchesDialog = !this.showSavedSearchesDialog;
        },

        deleteSearch(index) {
            this.savedSearches.splice(index, 1);
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
    flex: 1 0 20%;
    box-sizing: border-box;
}

.v-list-item__content {
    display: flex;
    align-items: center;
}
</style>