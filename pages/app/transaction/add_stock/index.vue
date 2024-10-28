<template>
    <div>
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <ResultDetail :open="showModalResult" :details="withdrawalItems" :froms="froms" :stocks="stocks"
            :customers="customers" :customer_id="customer_id" :customer_name="customer_name"
            @confirm="confirmAndAddDetails" @cancel="showModalResult = false" />

        <v-card class="custom-card" flat>
            <v-card-title class="d-flex align-center justify-center">
                <v-icon class="little-icon" color="#24b224">mdi-bank-plus</v-icon> &nbsp;
                <h3 class="mb-0">ข้อมูลหุ้นของลูกค้าใหม่</h3>
            </v-card-title>

            <v-row class="mb-0 mt-0 pa-0 justify-center">
                <v-col cols="2" class="ml-2">
                    <v-select v-model="searchBy" :items="searchOptions" label="ค้นหาจาก" dense outlined>
                    </v-select>
                </v-col>
                <v-col cols="3">
                    <v-autocomplete v-if="searchBy === 'customer_name'" v-model="customer_name" :items="customers"
                        item-text="name" item-value="no" label="ชื่อลูกค้า" dense outlined
                        :rules="[(v) => !!v || 'กรุณากรอกรหัสลูกค้า']">
                    </v-autocomplete>
                    <v-autocomplete v-else-if="searchBy === 'customer_id'" v-model="customer_id" :items="customers"
                        item-text="id" item-value="no" label="รหัสลูกค้า" dense outlined
                        :rules="[(v) => !!v || 'กรุณากรอกรหัสลูกค้า']">
                    </v-autocomplete>
                </v-col>
            </v-row>

            <v-card-text class="mb-0 mt-0 pa-0">
                <v-form>
                    <v-row class="mb-0 mt-0 pa-0" v-for="(item, index) in withdrawalItems" :key="index" align="center">
                        <v-col cols="3" class="ml-6">
                            <v-autocomplete v-model="item.stock_id" :items="stocks" item-text="name" item-value="no"
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
                            <v-select v-model="item.from_id" :items="froms" item-text="name" item-value="no"
                                label="ที่มาที่ไป" dense outlined>
                            </v-select>
                        </v-col>

                        <v-col cols="2" class="d-flex align-center">
                            <v-btn icon color="#e50211" @click="removeProduct(index)" class="mb-6">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                            <v-btn color="#24b224" @click="addProduct" text class="mb-6 ml-2">
                                <v-icon left>mdi-bank-plus</v-icon> เพิ่ม
                            </v-btn>
                        </v-col>
                    </v-row>

                    <div class="text-center">
                        <v-btn color="#24b224" @click="showModalResult = true" :disabled="!isFormValid" class="mr-2 mb-3">
                            บันทึก
                        </v-btn>
                        <v-btn color="#e50211" @click="goToStocksDetail" class="mb-3">
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
        await this.fetchFromData()
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
            valid: false,
            showModalResult: false,
            withdrawalItems: [{
                stock_id: null, dividend_amount: null, price: null, amount: null,
                closing_price: null, from_id: 1, comment: null
            }],
            customers: [],
            stocks: [],
            froms: [],

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
                    this.isAmountValid(item.amount) &&
                    this.isFromValid(item.from_id)
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

        updateStockData(item) {
            const stock = this.stocks.find(stock => stock.no === item.stock_id);
            if (stock) {
                item.dividend_amount = stock.dividend_amount;
                item.closing_price = stock.closing_price;
            } else {
                item.dividend_amount = null;
                item.closing_price = null;
                item.stock_id = null;
            }
        },

        async fetchFromData() {
            try {
                const response = await this.$store.dispatch('api/from/getFroms');
                if (response) {
                    this.froms = response.map(item => ({ no: item.no, name: item.from }));
                }
            } catch (error) {
            }
        },

        isFromValid(from_id) {
            return from_id !== null && from_id !== '';
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
                        this.$router.push('/app/transaction/add_stock');
                    } else if (RankID === '2') {
                        this.$router.push('/app/transaction/add_stock');
                    } else if (RankID === '3') {
                        this.$router.push('/app/transaction/add_stock');
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
                const money = detail.price * detail.amount;
                const balance_dividend = detail.dividend_amount * detail.amount;
                const present_price = detail.closing_price * detail.amount;
                const total = balance_dividend + present_price;
                const present_profit = total - money;
                const percent = ((present_profit - money) / money) * 100;
                const total_percent = (present_profit / money) * 100;

                const customerIdentifier = this.customer_id || this.customer_name;

                try {
                    await this.$store.dispatch('api/detail/addDetail', {
                        customer_id: customerIdentifier,
                        stock_id: detail.stock_id,
                        price: detail.price,
                        amount: detail.amount,
                        money,
                        balance_dividend,
                        present_price,
                        total,
                        present_profit,
                        percent,
                        total_percent,
                        from_id: detail.from_id,
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

        addProduct() {
            this.withdrawalItems.push({
                name: '',
                dividend_amount: null,
                closing_price: null,
                from_id: 1,
                comment: null,
            });
        },

        removeProduct(index) {
            this.withdrawalItems.splice(index, 1);
        },

        goBack() {
            this.$router.push('/app/transaction/customer_stock');
        },

        recordLog() {
            const details = this.withdrawalItems.map((item, index) => {
                return `TRANSACTION ${index + 1}\nNAME ${item.name}\nTYPE ${setName}\nDIVIDEND ${item.dividend_amount}\nCLOSE ${item.closing_price}\nCOMMENT ${item.comment}`;
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

        goToStocksDetail() {
            this.$router.push('/app/transaction/customer_stock');
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
