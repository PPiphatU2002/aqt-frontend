<template>

    <div>
        <ModalWarning :open="modal.warning.open" :message="modal.warning.message" :warning.sync="modal.warning.open" />
        <ModalConfirm :method="handleConfirm" :open="modalConfirmOpen" @update:confirm="modalConfirmOpen = false" />
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <EditStockDetail :open="editAllDialog" :data="editAllData" @update:edit="editAllDialog = false" />

        <v-card flat>
            <v-container>
                <v-row justify="center" align="center">
                    <v-col cols="auto">
                        <v-card-title class="d-flex align-center justify-center">
                            <v-icon class="little-icon" color="#85d7df">mdi-bank</v-icon>&nbsp;
                            <h3 class="mb-0">ข้อมูลหุ้นของลูกค้า</h3>
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

                            <v-autocomplete v-if="searchType !== 'port' && searchType !== 'updated_date'"
                                v-model="searchQuery" :items="getSearchItems(searchType)" label="ค้นหา" dense outlined
                                append-icon="mdi-magnify" class="mx-2 same-size small-font" hide-no-data hide-details
                                clearable></v-autocomplete>

                            <v-select v-if="searchType === 'port'" v-model="selectedTopics" :items="actionTopics" dense
                                outlined multiple class="mx-2 search-size small-font"></v-select>

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

                            <v-btn color="success" v-if="$auth.user.ranks_id === 1" @click="exportExcel" icon>
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
                <v-btn @click="goToAddStock" class="tab-icon-two" style="font-size: 1.5 rem; margin-left: auto;">
                    <v-icon left color="#24b224">mdi-bank-plus</v-icon> เพิ่มข้อมูลหุ้นของลูกค้า
                </v-btn>
            </div>

            <v-data-table :headers="filteredHeaders" :items="filtered" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                item-key="no" :items-per-page="5" style="overflow-x: auto; white-space: nowrap;">
                <template v-slot:item.emp_id="{ item }">
                    <div class="text-center">
                        <span v-if="getEmployeeByNo(item.emp_id)">
                            {{ getEmployeeByNo(item.emp_id).fname }} {{ getEmployeeByNo(item.emp_id).lname }}
                        </span>
                        <span v-else>ไม่ทราบ</span>
                    </div>
                </template>
                <template v-slot:item.customer_id="{ item }">
                    <div class="text-center">
                        {{ getCustomerByNo(item.customer_id)?.id || 'N/A' }}
                    </div>
                </template>
                <template v-slot:item.money="{ item }">
                    <div class="text-center" style="color:#ff66c4">
                        {{ item.money.toLocaleString() }}
                    </div>
                </template>
                <template v-slot:item.balance_dividend="{ item }">
                    <div class="text-center">
                        {{ item.balance_dividend.toLocaleString() }}
                    </div>
                </template>
                <template v-slot:item.present_price="{ item }">
                    <div class="text-center">
                        {{ item.present_price.toLocaleString() }}
                    </div>
                </template>
                <template v-slot:item.total="{ item }">
                    <div class="text-center">
                        {{ item.total.toLocaleString() }}
                    </div>
                </template>
                <template v-slot:item.price="{ item }">
                    <div class="text-center">
                        {{ item.price.toLocaleString() }}
                    </div>
                </template>
                <template v-slot:item.amount="{ item }">
                    <div class="text-center">
                        {{ item.amount.toLocaleString() }}
                    </div>
                </template>
                <template v-slot:item.customer_name="{ item }">
                    <div class="text-center">
                        {{ getCustomerByNo(item.customer_id)?.nickname || 'N/A' }}
                    </div>
                </template>
                <template v-slot:item.stock_id="{ item }">
                    <div class="text-center">
                        {{ getStockByNo(item.stock_id)?.name || 'N/A' }}
                    </div>
                </template>
                <template v-slot:item.from_id="{ item }">
                    <div class="text-center">
                        <span :style="{ color: getFromText(getFromByNo(item.from_id)?.from).color }">
                            {{ getFromByNo(item.from_id)?.from || 'N/A' }}
                        </span>
                    </div>
                </template>
                <template v-slot:item.present_profit="{ item }">
                    <div class="text-center">
                        <span :style="{ color: getColorForNumber(item.present_profit) }">
                            {{ item.present_profit.toLocaleString() }}
                        </span>
                    </div>
                </template>
                <template v-slot:item.percent="{ item }">
                    <div class="text-center">
                        <span :style="{ color: getColorForPercent(item.percent) }">
                            {{ item.percent.toFixed(2) }}%
                        </span>
                    </div>
                </template>
                <template v-slot:item.port="{ item }">
                    <div class="text-center">
                        <span :style="{ color: getPortText(item.total_percent).color }">
                            {{ getPortText(item.total_percent).text }}
                        </span>
                    </div>
                </template>
                <template v-slot:item.total_percent="{ item }">
                    <div class="text-center">
                        <span :style="{ color: getColorForPercent(item.total_percent) }">
                            {{ item.total_percent.toFixed(2) }}%
                        </span>
                    </div>
                </template>
                <template v-slot:item.updated_date="{ item }">
                    <div class="text-center">{{ formatDateTime(item.updated_date) }}</div>
                </template>
                <template v-slot:item.created_date="{ item }">
                    <div class="text-center">{{ formatDate(item.created_date) }}</div>
                </template>
                <template v-slot:item.detail="{ item }">
                    <div class="text-center">
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon v-bind="attrs" v-on="on" color="#85d7df">mdi-dots-vertical</v-icon>
                            </template>
                            <v-list class="custom-list">
                                <v-list-item @click="openEditAllDialog(item)" class="custom-list-item">
                                    <v-list-item-icon style="margin-right: 4px;">
                                        <v-icon class="icon-tab" color="#ffc800">mdi-pencil</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content style="font-size: 0.8rem;">แก้ไขข้อมูล</v-list-item-content>
                                </v-list-item>

                                <v-list-item @click="showConfirmDialog('delete', item)" class="custom-list-item">
                                    <v-list-item-icon style="margin-right: 4px;">
                                        <v-icon class="icon-tab" color="#e50211">mdi-cancel</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content style="font-size: 0.8rem;">ลบข้อมูล</v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </template>
            </v-data-table>

            <div class="text-center">
                <v-btn class="mb-4" color="#e50211" @click="goToHome">
                    <v-icon>mdi-home</v-icon>กลับไปหน้าหลัก
                </v-btn>
            </div>
        </v-card>
    </div>

</template>

<script>

import ExcelJS from 'exceljs';
import moment from 'moment-timezone';
import 'moment/locale/th'
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

export default {

    layout: 'user',
    middleware: 'auth',

    async mounted() {
        await this.checkRank();
        await this.fetchEmployeeData();
        await this.fetchDetailData();
        await this.fetchCustomerData();
        await this.fetchStockData();
        await this.fetchFromData();
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

            employees: [],
            details: [],
            customers: [],
            stocks: [],
            froms: [],

            sortBy: 'updated_date',
            currentAction: '',
            searchQuery: '',
            searchType: 'customer_id',
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
            editAllDialog: false,
            dialog: false,
            sortDesc: true,
            selectedEmployee: null,
            currentItem: null,
            employeeNo: null,
            actionType: null,
            selectedTopics: [],
            savedSearches: [],
            editAllData: {},
            visibleColumns: ['updated_date', 'customer_id', 'customer_name', 'stock_id', 'price', 'amount', 'money', 'balance_dividend', 'present_price', 'total', 'present_profit', 'percent', 'total_percent', 'created_date', 'port', 'from_id', 'comment', 'emp_id', 'detail'],

            searchQueries: {
                'customer_id': [],
                'customer_name': [],
                'stock_id': [],
                'emp_id': [],
            },

            searchTypes: [
                { text: 'รหัสสมาชิก', value: 'customer_id' },
                { text: 'ชื่อเล่น', value: 'customer_name' },
                { text: 'ชื่อหุ้นที่ติด', value: 'stock_id' },
                { text: 'ทำรายการโดย', value: 'emp_id' },
                { text: 'ประเภทพอร์ต', value: 'port' },
                { text: 'เวลา', value: 'updated_date' }
            ],

            actionTopics: [
                { text: 'ถือ', value: 'ถือ' },
                { text: 'แก้เกมได้', value: 'แก้เกมได้' },
                { text: 'ระวัง', value: 'ระวัง' },
                { text: 'กำไร', value: 'กำไร' },
            ],

            headers: [
                {
                    text: 'เวลา',
                    value: 'updated_date',
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'รหัสสมาชิก',
                    value: 'customer_id',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ชื่อเล่น',
                    value: 'customer_name',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ชื่อหุ้นที่ติด',
                    value: 'stock_id',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ราคาที่ติด',
                    value: 'price',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'จำนวนที่ติด',
                    value: 'amount',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'จำนวนเงิน',
                    value: 'money',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ยอดเงินปันผล',
                    value: 'balance_dividend',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'มูลค่าปัจจุบัน',
                    value: 'present_price',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'มูลค่าปัจจุบันและยอดเงินปันผล',
                    value: 'total',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'กำไร/ขาดทุน ปัจจุบัน',
                    value: 'present_profit',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'เปอร์เซ็น กำไร/ขาดทุน ปัจจุบัน',
                    value: 'total_percent',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'วันที่ซื้อหุ้น',
                    value: 'created_date',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ประเภทพอร์ต',
                    value: 'port',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ที่มาที่ไป',
                    value: 'from_id',
                    sortable: false,
                    align: 'center',
                    cellClass: 'text-center',
                },

                {
                    text: 'ความเห็นลูกค้า',
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
            let filteredDetails = this.details;
            this.savedSearches.forEach(search => {
                filteredDetails = filteredDetails.filter(detail => {
                    return this.applySearchFilter(detail, search);
                });
            });
            return filteredDetails;
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

        openEditAllDialog(employee) {
            this.editAllData = employee;
            this.editAllDialog = true;
        },

        showEditDialog(item) {
            this.selectedEmployee = item;
            this.editDialogOpen = true;
        },

        getSearchItems(type) {
            if (type === 'stock_id') {
                return this.stocks.map(stock => stock.name);
            } else if (type === 'customer_name') {
                return this.customers.map(customer => customer.nickname);
            } else if (type === 'customer_id') {
                return this.customers.map(customer => customer.id);
            } else if (type === 'emp_id') {
                return this.employees.map(employee => employee.fname + ' ' + employee.lname);
            }
            return [];
        },

        showConfirmDialog(action, item) {
            this.currentAction = action;
            this.currentItem = item;
            this.modalConfirmOpen = true;
        },

        async handleConfirm() {
            if (this.currentAction === 'delete') {
                try {
                    await this.$store.dispatch('api/detail/deleteDetail', this.currentItem.no);
                    this.modal.complete.message = 'ลบผู้ใช้งานนี้เรียบร้อยแล้ว';
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
                        this.$router.push('/app/transaction/customer_stock');
                    } else if (RankID === '2') {
                        this.$router.push('/app/transaction/customer_stock');
                    } else if (RankID === '3') {
                        this.$router.push('/app/transaction/customer_stock');
                    } else {
                        this.$router.push('/auth');
                    }
                }
            } else {
                this.$router.push('/');
            }
        },

        async fetchEmployeeData() {
            this.employees = await this.$store.dispatch('api/employee/getEmployees');
        },

        getEmployeeByNo(empNo) {
            return this.employees.find(employee => employee.no === empNo);
        },

        async fetchDetailData() {
            this.details = await this.$store.dispatch('api/detail/getDetails');
        },

        async fetchCustomerData() {
            this.customers = await this.$store.dispatch('api/customer/getCustomers');
        },

        getCustomerByNo(custNo) {
            return this.customers.find(customer => customer.no === custNo);
        },

        async fetchStockData() {
            this.stocks = await this.$store.dispatch('api/stock/getStocks');
        },

        getStockByNo(stockNo) {
            return this.stocks.find(stock => stock.no === stockNo);
        },

        async fetchFromData() {
            this.froms = await this.$store.dispatch('api/from/getFroms');
        },

        getFromByNo(fromNo) {
            return this.froms.find(from => from.no === fromNo);
        },

        getFromText(from) {
            if (from === 'หุ้นเก่า') {
                return { text: 'หุ้นเก่า', color: '#ffc800' };
            } else if (from === 'หุ้นใหม่') {
                return { text: 'หุ้นใหม่', color: '#38b6ff' };
            } else if (from === 'หุ้นแก้เกม') {
                return { text: 'หุ้นแก้เกม', color: '#ff914d' };
            } else {
                return { text: '', color: 'inherit' };
            }
        },

        getPortText(total_percent) {
            let port, color;
            if (total_percent >= 0) {
                port = 'กำไร';
                color = '#c1ff72';
            } else if (total_percent >= -10 && total_percent < 0) {
                port = 'ระวัง';
                color = '#ffde59';
            } else if (total_percent >= -19.99 && total_percent <= -10.01) {
                port = 'แก้เกมได้';
                color = '#85d7df';
            } else {
                port = 'ถือ';
                color = '#ff5757';
            }
            return { text: port, color: color };
        },

        getColorForNumber(value) {
            if (value < 0) {
                return '#e50211';
            } else if (value >= 0) {
                return '#24b224';
            } else {
                return 'inherit';
            }
        },

        getColorForPercent(value) {
            if (value >= 0) {
                return '#24b224';
            } else if (value >= -10 && value < 0) {
                return '#ffc800';
            } else if (value >= -19.99 && value <= -10.01) {
                return '#38b6ff';
            } else {
                return '#e50211';
            }
        },

        formatDateTime(date) {
            if (moment(date).isValid()) {
                return moment(date).format('YYYY-MM-DD HH:mm');
            }
            return 'Invalid Date';
        },

        formatDate(date) {
            if (moment(date).isValid()) {
                return moment(date).format('YYYY-MM-DD');
            }
            return 'Invalid Date';
        },

        openDetail(item) {
            this.selectedItemDetail = item.detail;
            this.dialog = true;
        },

        onSearchTypeChange() {
            this.isSearchFieldVisible = this.searchType !== 'updated_date' && this.searchType !== 'port';
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

            if (this.searchType === 'port') {
                this.addTopicToSearch();
            } else if (this.searchType === 'stock_id' || this.searchType === 'customer_name' || this.searchType === 'customer_id' || this.searchType === 'emp_id') {
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
                type: 'port',
                topics: [...this.selectedTopics],
                start: this.startDateTime,
                end: this.endDateTime
            });
            this.selectedTopics = [];
            this.startDateTime = '';
            this.endDateTime = '';
        },

        applySearchFilter(detail, search) {
            const field = detail[search.type];
            let queryMatched = true;
            const lowerCaseField = typeof field === 'string' ? field.toLowerCase() : '';
            if (search.type === 'customer_name') {
                queryMatched = this.searchQueries[search.type].some(query => {
                    const cust = this.getCustomerByNo(detail.customer_id);
                    return cust.nickname.toLowerCase().includes(query.toLowerCase());
                });
            } else if (search.type === 'customer_id') {
                queryMatched = this.searchQueries[search.type].some(query => {
                    const cust = this.getCustomerByNo(detail.customer_id);
                    return cust.id.toLowerCase().includes(query.toLowerCase());
                });
            } else if (search.type === 'stock_id') {
                queryMatched = this.searchQueries[search.type].some(query => {
                    const st = this.getStockByNo(detail.stock_id);
                    return st.name.toLowerCase().includes(query.toLowerCase());
                });
            } else if (search.type === 'emp_id') {
                queryMatched = this.searchQueries[search.type].some(query => {
                    const emp = this.getEmployeeByNo(detail.emp_id);
                    return emp.fname.toLowerCase().includes(query.toLowerCase()) + ' ' + emp.lname.toLowerCase().includes(query.toLowerCase());
                });
            } else {
                const searchQuery = search.query.toLowerCase();
                queryMatched = lowerCaseField.includes(searchQuery);
            }
            const timeMatched = search.type === 'updated_date' ? this.checkTimeRange(detail, search) : true;
            const topicMatched = search.topics ? search.topics.some(topic => topic === this.getPortText(detail.total_percent).text) : true;
            return queryMatched && timeMatched && topicMatched;
        },

        checkTimeRange(detail, search) {
            const detailTime = moment(detail.updated_date);
            const startTime = moment(search.start);
            const endTime = moment(search.end);
            return (!startTime.isValid() || detailTime.isSameOrAfter(startTime)) &&
                (!endTime.isValid() || detailTime.isSameOrBefore(endTime));
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

        exportExcel() {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            const headers = this.filteredHeaders
                .filter(header => header.value !== 'detail')
                .map(header => ({
                    header: header.text,
                    key: header.value,
                    style: { font: { name: 'Angsana New', size: 16 } }
                }));

            worksheet.columns = headers;

            this.filtered.forEach((item, index) => {
                const rowData = {};
                this.filteredHeaders.forEach(header => {
                    if (header.value === 'updated_date') {
                        rowData[header.value] = moment(item[header.value]).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm');
                    } else if (header.value === 'price') {
                        rowData[header.value] = item.price.toLocaleString();
                    } else if (header.value === 'amount') {
                        rowData[header.value] = item.amount.toLocaleString();
                    } else if (header.value === 'money') {
                        rowData[header.value] = item.money.toLocaleString();
                    } else if (header.value === 'total_percent') {
                        rowData[header.value] = item.total_percent.toFixed(2) + '%';
                    } else if (header.value === 'present_profit') {
                        rowData[header.value] = item.present_profit.toLocaleString();
                    } else if (header.value === 'total') {
                        rowData[header.value] = item.total.toLocaleString();
                    } else if (header.value === 'present_price') {
                        rowData[header.value] = item.present_price.toLocaleString();
                    } else if (header.value === 'balance_dividend') {
                        rowData[header.value] = item.balance_dividend.toLocaleString();
                    } else if (header.value === 'from_id') {
                        rowData[header.value] = this.getFromByNo(item.from_id).from;
                    } else if (header.value === 'stock_id') {
                        rowData[header.value] = this.getStockByNo(item.stock_id).name;
                    } else if (header.value === 'customer_id') {
                        rowData[header.value] = this.getCustomerByNo(item.customer_id).id;
                    } else if (header.value === 'customer_name') {
                        rowData[header.value] = this.getCustomerByNo(item.customer_id).nickname;
                    } else if (header.value === 'port') {
                        rowData[header.value] = this.getPortText(item.total_percent).text;
                    } else if (header.value === 'emp_id') {
                        rowData[header.value] = this.getEmployeeByNo(item.emp_id).fname + ' '+ this.getEmployeeByNo(item.emp_id).lname;
                    } else if (header.value !== 'detail') {
                        rowData[header.value] = item[header.value];
                    }
                });
                worksheet.addRow(rowData);
            });

            worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { bold: true, name: 'Angsana New', size: 18 };
            });

            worksheet.eachRow((row) => {
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                });
            });

            const currentDate = moment().tz('Asia/Bangkok').format('YYYY-MM-DD');
            workbook.xlsx.writeBuffer().then(buffer => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', `ข้อมูลลูกค้า-${currentDate}.xlsx`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        },

        goBack() {
            window.location.reload();
        },

        recordLog() {
            const stock = this.getStockByNo(this.currentItem.stock_id);
            const from = this.getFromByNo(this.currentItem.from_id);
            const customer = this.getCustomerByNo(this.currentItem.customer_id)
            const log = {
                customer_id: `${customer ? customer.id : 'ไม่พบรหัสลูกค้า'}`,
                emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
                emp_email: this.$auth.user.email,
                detail: this.currentAction === 'delete'
                    ? `ชื่อหุ้น : ${stock ? stock.name : 'ไม่พบชื่อหุ้น'}\nที่มาที่ไป : ${from ? from.from : 'ไม่พบที่มาที่ไป'}\nราคาที่ติด : ${this.currentItem.price}\nจำนวนที่ติด : ${this.currentItem.amount}`
                    : `ชื่อหุ้น : ${stock ? stock.name : 'ไม่พบชื่อหุ้น'}\nที่มาที่ไป : ${from ? from.from : 'ไม่พบที่มาที่ไป'}\nราคาที่ติด : ${this.currentItem.price}\nจำนวนที่ติด : ${this.currentItem.amount}`,
                type: 1,
                picture: this.$auth.user.picture || 'Unknown',
                action: this.currentAction === 'delete'
                    ? 'ลบข้อมูลหุ้นของลูกค้า'
                    : 'ไม่ลบข้อมูลหุ้นของลูกค้า',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };
            this.$store.dispatch('api/log/addLogs', log);
        },

        goToAddStock() {
            this.$router.push('/app/transaction/add_stock');
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
    flex: 1 0 12%;
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
</style>