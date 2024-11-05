<template>
    <v-dialog v-model="localOpen" max-width="500px">
        <v-card>
            <v-card-title class="d-flex justify-center">
                <v-icon justify="center" class="mr-3" size="40" color="#24b224">mdi-bank-check</v-icon>
                <span class="headline">ตรวจสอบข้อมูลหุ้นลูกค้า</span>
            </v-card-title>
            <v-card-text>
                <v-data-table :headers="headers" :items="formattedStocks" class="elevation-1" hide-default-footer>
                    <template v-slot:top>
                    </template>
                </v-data-table>
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
                <v-btn color="#24b224" @click="confirm" class="mb-4">ยืนยัน</v-btn>
                <v-btn color="#e50211" @click="cancel" class="ml-2 mb-4">ยกเลิก</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        open: Boolean,
        details: Array,
        type: Number,
        stocks: Array,
        customers: Array,
        customer_id: Number,
        customer_name: Number
    },
    data() {
        return {
            fetchstocks: [],
            fetchdetails: [],
            localOpen: this.open,
            headers: [
                { text: 'รหัสลูกค้า', value: 'customer_name' },
                { text: 'ชื่อหุ้น', value: 'stock_name' },
                { text: 'จำนวนที่ติด', value: 'price' },
                { text: 'ราคาที่ติด', value: 'amount' },
                { text: 'การกระทำ', value: 'action' },
            ],
        };
    },
    computed: {
    formattedStocks() {
        const stocks = this.stocks || [];
        const customers = this.customers || [];

        return this.details.map(detail => {
            // ใช้ getStockByDetail เพื่อค้นหา stock_name
            const detailName = this.getStockByDetail(detail.stock_id);
            const stockName = this.getStockName(detailName)

            const customer = customers.find(c => c.no === this.customer_id) ||
                             customers.find(c => c.no === this.customer_name) ||
                             { name: '', id: '' };

            return {
                ...detail,
                stock_name: stockName, // ใช้ stockName แทน
                customer_id: customer.id,
                customer_name: customer.name,
                action: this.getTypeText(detail.type),
            };
        });
    },
},


    async mounted() {
        await this.fetchStockData()
        await this.fetchDetailData()
    },

    methods: {
        async fetchStockData() {
            this.fetchstocks = await this.$store.dispatch('api/stock/getStocks');
        },

        getStockName(stockId) {
            const stock = this.fetchstocks.find(s => s.no === stockId);
            return stock ? stock.name : 'ยังไม่ระบุ';
        },

        async fetchDetailData() {
            this.fetchdetails = await this.$store.dispatch('api/detail/getDetails');
        },

        getStockByDetail(DetailId) {
            const detail = this.fetchdetails.find(d => d.no === DetailId);
            return detail ? detail.stock_id : 'ยังไม่ระบุ';
        },

        getTypeText(value) {
            if (value === 1) return 'ซื้อ';
            if (value === 2) return 'ขาย';
            return '';
        },
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
            this.localOpen = false;
        },
    },
    watch: {
        open(newValue) {
            this.localOpen = newValue; // Sync local state with prop changes
        },
        localOpen(newValue) {
            this.$emit('update:open', newValue); // Emit an event when localOpen changes
        }
    },
};
</script>
