<template>

    <div>
        <ModalWarning :open="modal.warning.open" :message="modal.warning.message" :warning.sync="modal.warning.open" />
        <ModalConfirm :method="handleConfirm" :open="modalConfirmOpen" @update:confirm="modalConfirmOpen = false" />
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <EditStock :open="editStock" :data="editAllData" @update:edit="editStock = false" />

        <v-card class="custom-card" flat>
            <v-container>
                <v-row justify="center" align="center">
                    <v-col cols="auto">
                        <v-card-title class="d-flex align-center justify-center">
                            <v-icon class="little-icon" color="#85d7df">mdi-archive</v-icon>&nbsp;
                            <h3 class="mb-0">ข้อมูลหุ้น</h3>
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

                            <v-autocomplete v-if="searchType !== 'set_id' && searchType !== 'updated_date'"
                                v-model="searchQuery" :items="getSearchItems(searchType)" label="ค้นหา" dense outlined
                                append-icon="mdi-magnify" class="mx-2 same-size small-font" hide-no-data
                                hide-details></v-autocomplete>

                            <v-select v-if="searchType === 'set_id'" v-model="selectedTopics" :items="actionTopics"
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

                            <v-btn color="success" @click="exportCSV" icon>
                                <v-icon>mdi-file-excel</v-icon>
                            </v-btn>
                        </div>
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
                <div>
                    <v-btn @click="goToTypeStock" class="tab-icon-three" style="font-size: 1.5 rem; margin-left: auto;">
                        <v-icon left color="#85d7df">mdi-archive-settings</v-icon> ประเภทหุ้น
                    </v-btn>
                    <v-btn @click="goToNewStock" class="tab-icon-two" style="font-size: 1.5 rem; margin-left: auto;">
                        <v-icon left color="#24b224">mdi-archive-plus</v-icon> เพิ่มหุ้น
                    </v-btn>
                </div>
            </div>

            <v-data-table :headers="filteredHeaders" :items="filtered" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                item-key="no" :items-per-page="5">
                <template v-slot:item.picture="{ item }">
                    <v-avatar size="40">
                        <img :src="`http://localhost:3001/file/profile/${item.picture}`" alt="picture" />
                    </v-avatar>
                </template>
                <template v-slot:item.set_id="{ item }">
                    <div class="text-center" :style="{ color: getFromText(getSetName(item.set_id)).color }">
                        {{ getSetName(item.set_id) }}
                    </div>
                </template>
                <template v-slot:item.emp_id="{ item }">
                    <div class="text-center">{{ getEmployeeName(item.emp_id) }}</div>
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
                                <v-list-item @click="openEditStock(item)" class="custom-list-item">
                                    <v-list-item-icon style="margin-right: 4px;">
                                        <v-icon class="icon-tab" color="#ffc800">mdi-pencil</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content style="font-size: 0.8rem;">แก้ไขข้อมูล</v-list-item-content>
                                </v-list-item>

                                <v-list-item @click="showConfirmDialog('delete', item)" class="custom-list-item">
                                    <v-list-item-icon style="margin-right: 4px;">
                                        <v-icon class="icon-tab" color="#e50211">mdi-cancel</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content style="font-size: 0.8rem;">ลบหุ้น</v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
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
        await this.fetchStockData();
        await this.fetchEmployeeData();
        await this.fetchSetData();
    },

    components: {
        DatePicker,
    },

    data() {
        return {
            modal: {
                warning: {
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

            stocks: [],
            sets: [],
            employees: [],

            sortBy: 'updated_date',
            currentAction: '',
            searchQuery: '',
            searchType: '',
            selectedItemDetail: '',
            startDateTime: '',
            endDateTime: '',
            editDialogOpen: false,
            isSearchFieldVisible: false,
            datePickerMenu: false,
            endDatePickerMenu: false,
            showSavedSearchesDialog: false,
            showColumnSelector: false,
            modalConfirmOpen: false,
            editStock: false,
            dialog: false,
            sortDesc: true,
            selectedStock: null,
            currentItem: null,
            stockNo: null,
            actionType: null,
            selectedTopics: [],
            savedSearches: [],
            editAllData: {},
            visibleColumns: ['updated_date', 'set_id', 'name', 'dividend_amount', 'closing_price', 'comment', 'emp_id', 'detail'],

            searchQueries: {
                'name': [],
                'emp_id': [],
            },

            searchTypes: [
                { text: 'ชื่อหุ้น', value: 'name' },
                { text: 'ทำรายการโดย', value: 'emp_id' },
                { text: 'ประเภท', value: 'set_id' },
                { text: 'เวลา', value: 'updated_date' }
            ],

            actionTopics: [
                { text: 'SET', value: 'SET' },
                { text: 'SET50', value: 'SET50' },
                { text: 'SET100', value: 'SET100' },
                { text: 'ETF', value: 'ETF' },
                { text: 'MAI', value: 'MAI' },
                { text: 'Warrants', value: 'Warrants' },
                { text: 'DR', value: 'DR' },
            ],

            headers: [
                {
                    text: 'เวลา',
                    value: 'updated_date',
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ประเภท',
                    value: 'set_id',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ชื่อหุ้น',
                    value: 'name',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'จำนวนปันผล',
                    value: 'dividend_amount',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ราคาปิด',
                    value: 'closing_price',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'หมายเหตุ',
                    value: 'comment',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ทำรายการโดย',
                    value: 'emp_id',
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
            let filteredStocks = this.stocks;
            this.savedSearches.forEach(search => {
                filteredStocks = filteredStocks.filter(stock => {
                    return this.applySearchFilter(stock, search);
                });
            });
            return filteredStocks;
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
            this.$router.push('/app/home');
        },

        async fetchSetData() {
            this.sets = await this.$store.dispatch('api/set/getSets')
        },

        getSetName(setId) {
            const set = this.sets.find(t => t.no === setId);
            return set ? set.set : '';
        },

        async fetchStockData() {
            this.stocks = await this.$store.dispatch('api/stock/getStocks');
        },

        async fetchEmployeeData() {
            this.employees = await this.$store.dispatch('api/employee/getEmployees');
        },

        getEmployeeName(empId) {
            const employee = this.employees.find(e => e.no === empId);
            return employee ? employee.fname + ' ' + employee.lname : 'ไม่ทราบ';
        },

        openEditStock(stock) {
            this.editAllData = stock;
            this.editStock = true;
        },

        showEditDialog(item) {
            this.selectedStock = item;
            this.editDialogOpen = true;
        },

        getSearchItems(type) {
            if (type === 'name') {
                return this.stocks.map(emp => emp.name);
            } else if (type === 'emp_id') {
                return this.stocks.map(emp => this.getEmployeeName(emp.emp_id));
            }
            return [];
        }
        ,

        showConfirmDialog(action, item) {
            this.currentAction = action;
            this.currentItem = item;
            this.modalConfirmOpen = true;
        },

        async handleConfirm() {
            if (this.currentAction === 'delete') {
                try {
                    await this.$store.dispatch('api/stock/deleteStock', this.currentItem.no);
                    this.modal.complete.message = 'ลบหุ้นนี้เรียบร้อยแล้ว';
                    this.recordLog();
                    this.modal.complete.open = true;
                } catch (warning) {
                    this.modal.complete.message = 'เกิดข้อผิดพลาดในการดำเนินการ';
                    this.modal.complete.open = true;
                }
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
                        this.$router.push('/app/stock/management');
                    } else if (RankID === '2') {
                        this.$router.push('/app/home');
                    } else if (RankID === '3') {
                        this.$router.push('/app/stock/management');
                    } else {
                        this.$router.push('/auth');
                    }
                }
            } else {
                this.$router.push('/');
            }
        },

        getFromText(set) {
            if (set === 'SET') {
                return { text: 'SET', color: '#24b224' };
            } else if (set === 'SET50') {
                return { text: 'SET50', color: '#ffc800' };
            } else if (set === 'SET100') {
                return { text: 'SET100', color: '#38b6ff' };
            } else if (set === 'ETF') {
                return { text: 'ETF', color: '#8c52ff' };
            } else if (set === 'MAI') {
                return { text: 'MAI', color: '#ff914d' };
            } else if (set === 'Warrants') {
                return { text: 'Warrants', color: '#c1ff72' };
            } else if (set === 'DR') {
                return { text: 'DR', color: '#ff5757' };
            } else {
                return { text: '', color: 'inherit' };
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
            this.isSearchFieldVisible = this.searchSet !== 'updated_date' && this.searchType !== 'set_id';
        },

        validateDateRange() {
            const start = moment(this.startDateTime);
            const end = moment(this.endDateTime);

            if (start.isValid() && end.isValid() && start.isAfter(end)) {
                this.modal.warning.open = true;
                return false;
            }
            return true;
        },

        addSearch() {
            if (!this.validateDateRange()) {
                return;
            }
            if (this.searchType === 'set_id') {
                this.addTopicToSearch();
            } else if (this.searchType === 'name' || this.searchType === 'emp_id') {
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
            if (typeof this.searchQuery === 'string') {
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
            } else {
                console.error('searchQuery is not a string:', this.searchQuery);
            }
        },

        addTopicToSearch() {
            this.savedSearches.push({
                query: '',
                type: 'set_id',
                topics: [...this.selectedTopics],
                start: this.startDateTime,
                end: this.endDateTime
            });
            this.selectedTopics = [];
            this.startDateTime = '';
            this.endDateTime = '';
        },

        applySearchFilter(stock, search) {
            const field = stock[search.type];
            let queryMatched = true;
            const lowerCaseField = typeof field === 'string' ? field.toLowerCase() : '';
            if (search.type === 'emp_id') {
                queryMatched = this.searchQueries[search.type].some(query => {
                    const empName = this.getEmployeeName(stock.emp_id);
                    return empName.toLowerCase().includes(query.toLowerCase());
                });
            }
            else if (search.type === 'name') {
                queryMatched = this.searchQueries[search.type].some(query =>
                    lowerCaseField.includes(query.toLowerCase())
                );
            } else {
                const searchQuery = search.query.toLowerCase();
                queryMatched = lowerCaseField.includes(searchQuery);
            }
            const timeMatched = search.type === 'updated_date' ? this.checkTimeRange(stock, search) : true;
            const topicMatched = search.topics ? search.topics.some(topic => topic === this.getSetName(stock.set_id)) : true;
            return queryMatched && timeMatched && topicMatched;
        },

        checkTimeRange(stock, search) {
            const stockTime = moment(stock.updated_date);
            const startTime = moment(search.start);
            const endTime = moment(search.end);
            return (!startTime.isValid() || stockTime.isSameOrAfter(startTime)) &&
                (!endTime.isValid() || stockTime.isSameOrBefore(endTime));
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
                    if (header.value === 'updated_date') {
                        dataItem['เวลา'] = this.formatDateTime(item.updated_date);
                    } else if (header.value === 'set_id') {
                        dataItem['ประเภท'] = this.getSetName(item.set_id);
                    } else if (header.value === 'emp_id') {
                        dataItem['ทำรายการโดย'] = this.getEmployeeName(item.emp_id);
                    } else {
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
            link.setAttribute('download', `ข้อมูลหุ้น-${currentDate}.csv`);
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

        goBack() {
            window.location.reload();
        },

        recordLog() {
            const log = {
                emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
                emp_email: this.$auth.user.email,
                detail: this.currentAction === 'delete'
                    ? `NAME ${this.currentItem.name}\nTYPE ${this.getSetName(this.currentItem.set_id)}\nDIVIDEND ${this.currentItem.dividend_amount}\nCLOSE ${this.currentItem.closing_price}\nREMARK ${this.currentItem.comment}`
                    : `NAME ${this.currentItem.name}\nTYPE ${this.getSetName(this.currentItem.set_id)}\nDIVIDEND ${this.currentItem.dividend_amount}\nCLOSE ${this.currentItem.closing_price}\nREMARK ${this.currentItem.comment}`,
                type: 2,
                picture: this.$auth.user.picture || 'Unknown',
                action: this.currentAction === 'delete'
                    ? 'ลบหุ้น'
                    : 'ไม่ลบหุ้น',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };
            this.$store.dispatch('api/log/addLogs', log);
        },

        goToNewStock() {
            this.$router.push('/app/stock/new_stock');
        },

        goToTypeStock() {
            this.$router.push('/app/stock/type');
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

.tab-icon-two {
    cursor: pointer;
    margin-right: 24px;
    margin-left: 0px;
}

.tab-icon-three {
    cursor: pointer;
    margin-right: 8px;
    margin-left: 0px;
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