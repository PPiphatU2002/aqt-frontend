<template>
    <v-dialog v-model="localOpen" max-width="600px">
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
        froms: Array,
        stocks: Array,
        customers: Array,
        customer_id: Number,
        customer_name: Number,
        created_date: String,
    },
    data() {
        return {
            localOpen: this.open, // Use a local data property
            headers: [
                { text: 'รหัสลูกค้า', value: 'customer_name' },
                { text: 'ชื่อหุ้น', value: 'stock_name' },
                { text: 'จำนวนที่ติด', value: 'price' },
                { text: 'ราคาที่ติด', value: 'amount' },
                { text: 'วันที่ซื้อหุ้น', value: 'created_date' },
                { text: 'ที่มาที่ไป', value: 'from_name' },
            ],
        };
    },
    computed: {
        formattedStocks() {
            const froms = this.froms || [];
            const stocks = this.stocks || [];
            const customers = this.customers || [];

            return this.details.map(detail => {
                const from = froms.find(f => f.no === detail.from_id);
                const stock = stocks.find(s => s.no === detail.stock_id);

                const customer = customers.find(c => c.no === this.customer_id) ||
                    customers.find(c => c.no === this.customer_name) ||
                    { name: '', id: '' };

                return {
                    ...detail,
                    from_name: from ? from.name : '',
                    stock_name: stock ? stock.name : '',
                    customer_id: customer.id,
                    customer_name: customer.id,
                };
            });
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
    methods: {
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
            this.localOpen = false; // Close the dialog on cancel
        },
    },
};
</script>
