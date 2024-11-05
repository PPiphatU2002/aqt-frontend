<template>
    <div>
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <ResultTransaction :open="showModalResult" :details="withdrawalItems"
            :stocks="withdrawalItems.map(item => ({ stock_id: item.stock_id }))" :customers="customers"
            :customer_id="customer_id" :customer_name="customer_name" :type="type" @confirm="confirmAndAddDetails"
            @cancel="showModalResult = false" />

        <v-card class="custom-card" flat>
            <v-card-title class="d-flex align-center justify-center">
                <v-icon class="little-icon" color="#24b224">mdi-cash-plus</v-icon> &nbsp;
                <h3 class="mb-0">ข้อมูลการซื้อขายหุ้นของลูกค้าใหม่</h3>
            </v-card-title>

            <v-row class="mb-0 mt-0 pa-0 justify-center">
                <v-col cols="2" class="ml-2">
                    <v-select v-model="searchBy" :items="searchOptions" label="ค้นหาจาก" dense outlined>
                    </v-select>
                </v-col>
                <v-col cols="3">
                    <v-autocomplete v-if="searchBy === 'customer_name'" v-model="customer_name" :items="customers"
                        item-text="name" item-value="no" label="ชื่อลูกค้า" dense outlined clearable
                        :rules="[(v) => !!v || 'กรุณากรอกชื่อลูกค้า']">
                    </v-autocomplete>
                    <v-autocomplete v-else-if="searchBy === 'customer_id'" v-model="customer_id" :items="customers"
                        item-text="id" item-value="no" label="รหัสลูกค้า" dense outlined clearable
                        :rules="[(v) => !!v || 'กรุณากรอกรหัสลูกค้า']">
                    </v-autocomplete>
                </v-col>
                <v-col cols="3">
                    <v-autocomplete v-model="commission_id" :items="commissions" item-text="name" item-value="no"
                        label="ค่าธรรมเนียม" dense outlined clearable :rules="[(v) => !!v || 'กรุณากรอกค่าธรรมเนียม']">
                    </v-autocomplete>
                </v-col>
            </v-row>


            <v-card-text class="mb-0 mt-0 pa-0">
                <v-form>
                    <v-row class="mb-0 mt-0 pa-0" v-for="(item, index) in withdrawalItems" :key="index" align="center">
                        <v-col cols="3" class="ml-6">
                            <v-autocomplete v-model="item.stock_id" :items="details" item-text="name" item-value="no"
                                label="ชื่อหุ้นที่ติด" dense outlined :rules="[(v) => !!v || 'กรุณากรอกชื่อหุ้น']"
                                clearable @change="updateStockData(item)">
                            </v-autocomplete>
                        </v-col>

                        <v-col cols="2">
                            <v-text-field v-model="item.price" label="ราคาที่ติด" type="text" dense outlined
                                :rules="[(v) => !v || /^[0-9]*\.?[0-9]+$/.test(v) || 'กรุณากรอกตัวเลข']">
                            </v-text-field>
                        </v-col>

                        <v-col cols="2">
                            <v-text-field v-model="item.amount" label="จำนวนที่ติด" type="text" dense outlined
                                :rules="[(v) => !v || /^[0-9]*\.?[0-9]+$/.test(v) || 'กรุณากรอกตัวเลข']">
                            </v-text-field>
                        </v-col>

                        <v-col cols="2">
                            <v-select v-model="item.type"
                                :items="[{ value: 1, text: 'ซื้อ' }, { value: 2, text: 'ขาย' }]" item-text="text"
                                item-value="value" label="ซื้อ/ขาย" dense outlined clearable
                                :rules="[(v) => !!v || 'กรุณาเลือกซื้อหรือขาย']">
                            </v-select>
                        </v-col>


                        <v-col cols="2" class="d-flex align-center">
                            <v-btn icon color="#e50211" @click="removeProduct(index)" class="mb-6">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                            <v-btn color="#24b224" @click="addProduct" text class="mb-6 ml-2">
                                <v-icon left>mdi-cash-plus</v-icon> เพิ่ม
                            </v-btn>
                        </v-col>
                    </v-row>

                    <div class="text-center">
                        <v-btn color="#24b224" @click="showModalResult = true" :disabled="!isFormValid"
                            class="mr-2 mb-3">
                            บันทึก
                        </v-btn>
                        <v-btn color="#e50211" @click="goToStocksTransaction" class="mb-3">
                            ย้อนกลับ
                        </v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import moment from 'moment'
moment.locale('th')

export default {
    layout: 'user',
    middleware: 'auth',

    async mounted() {
        await this.checkRank()
        await this.fetchCustomerData()
        await this.fetchStockData()
        await this.fetchCommissionData()
        await this.fetchDetailData()
    },

    watch: {
        customer_id: {
            handler: 'fetchDetailData',
            immediate: true
        },
        customer_name: {
            handler: 'fetchDetailData',
            immediate: true
        }
    },

    data() {
        return {
            modal: {
                complete: {
                    open: false,
                    message: ''
                },
                error: {
                    open: false,
                    message: ''
                },
            },
            searchBy: 'customer_id',
            searchOptions: [
                { text: 'รหัสลูกค้า', value: 'customer_id' },
                { text: 'ชื่อลูกค้า', value: 'customer_name' }
            ],
            customer_id: null,
            customer_name: null,
            commission_id: 1,

            valid: false,
            showModalResult: false,
            withdrawalItems: [{
                stock_id: null, dividend_amount: null, price: null, amount: null,
                closing_price: null, type: 1,
            }],
            type: null,
            customers: [],
            commissions: [],
            stocks: [],
            details: []

        }
    },

    computed: {
        isFormValid() {
            const isCustomerNameValid = this.searchBy === 'customer_name' ? this.customer_name : true;
            const isCustomerIdValid = this.searchBy === 'customer_id' ? this.customer_id : true;

            return (
                isCustomerNameValid &&
                isCustomerIdValid &&
                this.withdrawalItems.every(item =>
                    this.isStockValid(item.stock_id) &&
                    this.isPriceValid(item.price) &&
                    this.isAmountValid(item.amount)
                )
            );
        },
    },

    methods: {
        async fetchStockData() {
            const stockData = await this.$store.dispatch('api/stock/getStocks');
            this.stocks = stockData;

            this.withdrawalItems.forEach((item) => {
                if (item.stock_id) {
                    const stock = stockData.find(stock => stock.no === item.stock_id);
                    if (stock) {
                        item.dividend_amount = stock.dividend_amount;
                        item.closing_price = stock.closing_price;
                    } else {
                        item.dividend_amount = null;
                        item.closing_price = null;
                    }
                }
            });
        },

        async fetchDetailData() {
            this.details = [];
            const customerIdentifier = this.customer_id || this.customer_name;
            if (!customerIdentifier) return;

            try {
                const response = await this.$store.dispatch('api/detail/getDetails', { customer_id: customerIdentifier });
                this.details = response.filter(detail =>
                    detail.customer_id === customerIdentifier || detail.customer_name === customerIdentifier
                );
                await this.fetchStockData();

                this.details = this.details.map(detail => {
                    const stock = this.stocks.find(stock => stock.no === detail.stock_id);
                    return {
                        ...detail,
                        name: stock ? `${stock.name} (${detail.money})` : 'ไม่พบหุ้น',
                    };
                });

            } catch (error) {
                this.details = [];
            }
        },

        updateStockData(item) {
            const stockDetail = this.details.find(d => d.no === item.stock_id);
            if (stockDetail) {
                item.stock_detail_id = stockDetail.no;
            } else {
                item.stock_detail_id = null; // ถ้าไม่พบ ให้เซ็ตเป็น null
            }
        },

        isStockValid(stock_id) {
            return stock_id !== null && stock_id !== '';
        },

        isPriceValid(price) {
            return price !== null && price !== '';
        },

        isAmountValid(amount) {
            return amount !== null && amount !== '';
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
                        this.$router.push('/app/transaction/add_transaction');
                    } else if (RankID === '2') {
                        this.$router.push('/app/transaction/add_transaction');
                    } else if (RankID === '3') {
                        this.$router.push('/app/transaction/add_transaction');
                    } else {
                        this.$router.push('/auth');
                    }
                }
            } else {
                this.$router.push('/');
            }
        },

        openModal() {
            this.showModalResult = true;
        },

        async confirmAndAddDetails() {
            for (const detail of this.withdrawalItems) {
                const stock = this.stocks.find(stock => stock.no === detail.stock_id);
                const result = detail.price * detail.amount;

                // หาค่าธรรมเนียมจาก commissions
                const commission = this.commissions.find(comm => comm.no === this.commission_id);
                const commissionRate = commission ? commission.name : 0; // ใช้ค่าธรรมเนียม หากไม่พบให้ใช้ 0

                const comfee = result * commissionRate; // คำนวณค่าธรรมเนียม
                const vat = comfee * 0.07;
                const total = result + comfee + vat;

                const stockDetailId = detail.stock_detail_id;

                try {
                    await this.$store.dispatch('api/transaction/addTransaction', {
                        stock_detail_id: stockDetailId,
                        type: detail.type,
                        price: parseFloat(detail.price),
                        amount: parseFloat(detail.amount),
                        result,
                        comfee,
                        vat,
                        total,
                        commission_id: this.commission_id, // ใช้ no ของค่าธรรมเนียม
                        emp_id: this.$auth.user.no,
                        created_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        updated_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    });
                } catch (error) {
                    if (error.response && error.response.status === 400) {
                        this.modal.error.message = `มีชื่อหุ้นนี้ในระบบแล้ว : ${detail.stock_id}`;
                        this.modal.error.open = true;
                        return;
                    }
                }
            }
            this.modal.complete.message = 'เพิ่มหุ้นเรียบร้อยแล้ว!';
            this.modal.complete.open = true;
            this.showModalResult = false;
        },

        findDuplicateIds(stocks) {
            const names = stocks.map(stock => stock.name);
            return names.filter((name, index) => names.indexOf(name) !== index && name);
        },

        async fetchCustomerData() {
            try {
                const response = await this.$store.dispatch('api/customer/getCustomers');
                if (response) {
                    this.customers = response.map(item => ({ no: item.no, id: item.id, name: item.nickname }));
                }
            } catch (error) {
            }
        },

        async fetchCommissionData() {
            try {
                const response = await this.$store.dispatch('api/commission/getCommissions');
                if (response) {
                    this.commissions = response.map(item => ({ no: item.no, name: item.commission }));
                }
            } catch (error) {
            }
        },

        addProduct() {
            this.withdrawalItems.push({
                stock_id: null,
                name: '',
                commission_id: null,
                dividend_amount: null,
                closing_price: null,
                type: null,
            });
        },

        removeProduct(index) {
            this.withdrawalItems.splice(index, 1);
        },

        goBack() {
            this.$router.push('/app/transaction/customer_trade');
        },

        recordLog() {
            const details = this.withdrawalItems.map((item, index) => {
                return `TRANSACTION ${index + 1}\nNAME ${item.name}\nTYPE ${setName}\nDIVIDEND ${item.dividend_amount}\nCLOSE ${item.closing_price}}`;
            }).join('\n\n');

            const log = {
                emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
                emp_email: this.$auth.user.email,
                detail: details.trim(),
                type: 1,
                picture: this.$auth.user.picture || 'Unknown',
                action: 'เพิ่มหุ้นของลูกค้า',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };

            this.$store.dispatch('api/log/addLogs', log);
        },

        goToStocksTransaction() {
            this.$router.push('/app/transaction/customer_trade');
        },
    },
};
</script>

<style scoped>
.little-icon {
    font-size: 3rem;
    margin-right: 8px;
    margin-left: 8px;
}

.custom-card {
    max-width: 800px;
    width: 100%;
    margin: auto;
}
</style>
