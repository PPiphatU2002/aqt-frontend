<template>
    <v-dialog v-model="open" max-width="600px">
        <v-card>
            <v-card-title class="d-flex justify-center">
                <v-icon justify="center" class="mr-3" size="40" color="#24b224">mdi-text-box-check</v-icon>
                <span class="headline">ตรวจสอบข้อมูลลูกค้า</span>
            </v-card-title>
            <v-card-text>
                <v-data-table :headers="headers" :items="formattedCustomers" class="elevation-1" hide-default-footer>
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
        customers: Array,
        types: Array,
        bases: Array,
    },
    data() {
        return {
            headers: [
                { text: 'ไอดีลูกค้า', value: 'id' },
                { text: 'ชื่อเล่น', value: 'nickname' },
                { text: 'ประเภท', value: 'type_name' },
                { text: 'ฐานทุน', value: 'base_name' },
            ],
        };
    },
    computed: {
        formattedCustomers() {
            const types = this.types || [];
            const bases = this.bases || [];

            return this.customers.map(customer => {
                const type = types.find(t => t.id === customer.type_id);
                const base = bases.find(b => b.id === customer.base_id);
                return {
                    ...customer,
                    type_name: type ? type.name : '',
                    base_name: base ? base.name : '',
                };
            });
        },
    },

    methods: {
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
        },
    },
};
</script>
