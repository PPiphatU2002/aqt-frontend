<template>

    <div>
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />

        <v-card flat>
            <v-container>
                <v-row justify="center" align="center">
                    <v-col cols="auto">
                        <v-card-title class="d-flex align-center justify-center">
                            <v-icon class="little-icon">mdi-home-clock</v-icon>&nbsp;
                            <h3 class="mb-0">ประวัติพนักงาน</h3>
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

                            <v-autocomplete v-if="searchType !== 'action' && searchType !== 'time'"
                                v-model="searchQuery" :items="getSearchItems(searchType)" label="ค้นหา" dense outlined
                                append-icon="mdi-magnify" class="mx-2 same-size small-font" hide-no-data
                                hide-details></v-autocomplete>


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

                            <v-btn color="success" @click="exportCSV" icon>
                                <v-icon>mdi-file-excel</v-icon>
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
                item-key="no" :items-per-page="5">
                <template v-slot:item.picture="{ item }">
                    <v-avatar size="40">
                        <img :src="`http://localhost:3001/file/profile/${item.picture}`" alt="picture" />
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
            <div class="text-center">
                <v-btn class = "mb-4" color="#e50211" @click="goToHome">
                    <v-icon>mdi-home</v-icon>กลับไปหน้าหลัก
                </v-btn>
            </div>
        </v-card>

        <v-dialog v-model="dialog" max-width="300px">
            <v-card>
                <v-card-title class="headline"
                    style="justify-content: center; display: flex;">รายละเอียดเพิ่มเติม</v-card-title>
                <v-card-text>
                    <div v-for="line in formattedDetailLines" :key="line">
                        <template v-if="line.includes('.jpg') || line.includes('.png') || line.includes('.jpeg')">
                            <div class="image-container">
                                <img :src="`http://localhost:3001/file/profile/${line}`" alt="detail image" width="100"
                                    height="100" />
                            </div>
                        </template>
                        <template v-else-if="line.includes('PHONE')">
                            <v-icon color="green">mdi-phone</v-icon>
                            {{ line.replace('PHONE', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('NEW')">
                            <v-icon color="white">mdi-lock-reset</v-icon>
                            {{ maskNewData(line.replace('NEW', '').trim()) }}
                        </template>
                        <template v-else-if="line.includes('GENDER')">
                            <v-icon color="blue">mdi-gender-male-female</v-icon>
                            {{ line.replace('GENDER', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('NAME')">
                            <v-icon color="white">mdi-pen</v-icon>
                            {{ line.replace('NAME', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('SUR')">
                            <v-icon color="yellow">mdi-home-group</v-icon>
                            {{ line.replace('SUR', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('EMAIL')">
                            <v-icon color="red">mdi-email</v-icon>
                            {{ line.replace('EMAIL', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('STATUS')">
                            <v-icon color="orange">mdi-information-symbol</v-icon>
                            {{ line.replace('STATUS', '').trim() }}
                        </template>
                        <template v-else-if="line.includes('RANK')">
                            <v-icon color="purple">mdi-chair-rolling</v-icon>
                            {{ line.replace('RANK', '').trim() }}
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

    layout: 'developer',
    middleware: 'auth',

    async mounted() {
        await this.checkRank();
        await this.fetchLogData();
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
            },

            logs: [],

            startDateTime: '',
            endDateTime: '',
            selectedItemDetail: '',
            searchQuery: '',
            searchType: 'emp_name',
            sortBy: 'time',
            sortDesc: true,
            dialog: false,
            isSearchFieldVisible: false,
            datePickerMenu: false,
            endDatePickerMenu: false,
            showSavedSearchesDialog: false,
            showColumnSelector: false,
            selectedTopics: [],
            savedSearches: [],
            visibleColumns: ['time', 'picture', 'action', 'emp_email', 'emp_name', 'detail'],

            searchQueries: {
                'emp_name': [],
                'emp_email': [],
            },

            searchTypes: [
                { text: 'ชื่อ-นามสกุล', value: 'emp_name' },
                { text: 'อีเมล', value: 'emp_email' },
                { text: 'การกระทำ', value: 'action' },
                { text: 'เวลา', value: 'time' }
            ],

            actionTopics: [
                { text: 'เข้าสู่ระบบ', value: 'เข้าสู่ระบบ' },
                { text: 'ออกจากระบบ', value: 'ออกจากระบบ' },
                { text: 'อัพโหลดรูปภาพ', value: 'อัพโหลดรูปภาพ' },
                { text: 'เปลี่ยนรหัสผ่าน', value: 'เปลี่ยนรหัสผ่าน' },
                { text: 'แก้ไขข้อมูลส่วนตัว', value: 'แก้ไขข้อมูลส่วนตัว' },
                { text: 'แก้ไขข้อมูลผู้ใช้งาน', value: 'แก้ไขข้อมูลผู้ใช้งาน' },
                { text: 'อนุมัติผู้ใช้งาน', value: 'อนุมัติผู้ใช้งาน' },
                { text: 'ไม่อนุมัติผู้ใช้งาน', value: 'ไม่อนุมัติผู้ใช้งาน' },
                { text: 'ลบผู้ใช้งาน', value: 'ลบผู้ใช้งาน' },
            ],

            headers: [
                {
                    text: 'เวลา',
                    value: 'time',
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
                    text: 'การกระทำ',
                    value: 'action',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'อีเมล',
                    value: 'emp_email',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ชื่อ-นามสกุล',
                    value: 'emp_name',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'หมายเหตุ',
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
        goToHome() {
            this.$router.push('/developer/home');
        },

        getSearchItems(type) {
            if (type === 'emp_name') {
                return this.logs.map(log => log.emp_name);
            } else if (type === 'emp_email') {
                return this.logs.map(log => log.emp_email);
            }
            return [];
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
                        this.$router.push('/developer/history/employee');
                    } else if (RankID === '2') {
                        this.$router.push('/employee/home');
                    } else if (RankID === '3') {
                        this.$router.push('/admin/history/employee');
                    } else {
                        this.$router.push('/auth');
                    }
                }
            } else {
                this.$router.push('/');
            }
        },

        async fetchLogData() {
            this.logs = await this.$store.dispatch('api/log/getLogsType', '4');
        },

        getActionColor(action) {
            if (action === 'ออกจากระบบ') {
                return '#e50211';
            } else if (action === 'เข้าสู่ระบบ') {
                return '#24b224';
            } else if (action === 'เปลี่ยนรหัสผ่าน') {
                return '#ffc800';
            } else if (action === 'อัพโหลดรูปภาพ') {
                return '#38b6ff';
            } else if (action === 'แก้ไขข้อมูลส่วนตัว') {
                return '#8c52ff';
            } else if (action === 'แก้ไขข้อมูลผู้ใช้งาน') {
                return '#ff914d';
            } else if (action === 'อนุมัติผู้ใช้งาน') {
                return '#c1ff72';
            } else if (action === 'ไม่อนุมัติผู้ใช้งาน') {
                return '#ff5757';
            } else if (action === 'ลบผู้ใช้งาน') {
                return '#ff66c4';
            }
            else {
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

        onSearchTypeChange() {
            this.isSearchFieldVisible = this.searchType !== 'time' && this.searchType !== 'action';
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

        getSearchTypeText(type) {
            const found = this.searchTypes.find(item => item.value === type);
            return found ? found.text : type;
        },

        exportCSV() {
            const filteredData = this.filtered.map(item => {
                const dataItem = {};
                this.filteredHeaders.forEach(header => {
                    if (header.value !== 'picture') {
                        dataItem[header.text] = item[header.value];
                    }
                });
                return dataItem;
            });

            const csv = Papa.unparse(filteredData);
            const bom = '\uFEFF';
            const csvWithBom = bom + csv;

            const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const currentDate = moment().format('YYYY-MM-DD');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `ประวัติพนักงาน-${currentDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        convertToCSV(objArray) {
            const array = [Object.keys(objArray[0])].concat(objArray);

            return array.map(row => {
                return Object.values(row).map(value => `"${value}"`).join(',');
            }).join('\n');
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
</style>