<template>
    <div>
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <ResultStock :open="showModalResult" :stocks="withdrawalItems" :sets="sets" @confirm="confirmAndAddCustomers"
            @cancel="showModalResult = false" />

        <v-card class="custom-card" flat>
            <v-card-title class="d-flex align-center justify-center">
                <v-icon class="little-icon" color="#24b224">mdi-archive-plus</v-icon> &nbsp;
                <h3 class="mb-0">หุ้นใหม่</h3>
            </v-card-title>

            <v-card-text>
                <v-form>
                    <v-row class="mb-0 mt-0 pa-0" v-for="(item, index) in withdrawalItems" :key="index" align="center">
                        <v-col cols="3" class="ml-2">
                            <v-text-field v-model="item.name" label="ชื่อหุ้น" type="text" dense outlined
                                :rules="[(v) => !!v || 'กรุณากรอกชื่อหุ้น']">
                            </v-text-field>
                        </v-col>


                        <v-col cols="2">
                            <v-select v-model="item.set_id" :items="sets" item-text="name" item-value="id"
                                label="ประเภท" dense outlined>
                            </v-select>
                        </v-col>

                        <v-col cols="2">
                            <v-text-field v-model="item.dividend_amount" label="ปันผลครึ่งปีแรก/หลัง" type="text" dense
                                outlined :rules="[(v) => !v || /^[0-9]*\.?[0-9]+$/.test(v) || 'กรุณากรอกตัวเลข']">
                            </v-text-field>
                        </v-col>

                        <v-col cols="2">
                            <v-text-field v-model="item.closing_price" label="ราคาปิดวันศุกร์" type="text" dense
                                outlined :rules="[(v) => !v || /^[0-9]*\.?[0-9]+$/.test(v) || 'กรุณากรอกตัวเลข']">
                            </v-text-field>
                        </v-col>

                        <v-col cols="2" class="d-flex align-center">
                            <v-btn icon color="#e50211" @click="removeProduct(index)" class="mb-6">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                            <v-btn color="#24b224" @click="addProduct" text class="mb-6 ml-2">
                                <v-icon left>mdi-archive-plus</v-icon> เพิ่มหุ้น
                            </v-btn>
                        </v-col>
                    </v-row>

                    <div class="text-center">
                        <v-btn color="#24b224" @click="showModalResult = true" :disabled="!isFormValid" class="mr-2">
                            บันทึก
                        </v-btn>
                        <v-btn color="#e50211" @click="goToStocksManagement">
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
    layout: 'developer',
    middleware: 'auth',

    async mounted() {
        await this.checkRank()
        await this.fetchSetsData()
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
            valid: false,
            showModalResult: false,
            withdrawalItems: [{
                name: '', set_id: null, dividend_amount: null,
                closing_price: null, comment: null
            }],
            sets: [],

        }
    },

    computed: {
        isFormValid() {
            return this.withdrawalItems.every(item =>
                this.isNicknameValid(item.name)
            );
        },
    },

    methods: {
        isFloatValid(value) {
            return !!value && /^[0-9]*\.?[0-9]+$/.test(value);
        },

        isNicknameValid(name) {
            return name !== null && name !== '';
        },

        isFromValid(set_id) {
            return set_id !== null && set_id !== '';
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
                        this.$router.push('/developer/stock/new_stock');
                    } else if (RankID === '2') {
                        this.$router.push('/employee/home');
                    } else if (RankID === '3') {
                        this.$router.push('/admin/stock/new_stock');
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

        async confirmAndAddCustomers() {
            const duplicateIds = this.findDuplicateIds(this.withdrawalItems);
            if (duplicateIds.length > 0) {
                this.modal.error.message = `มีหุ้นซ้ำ : ${duplicateIds.join(', ')}`;
                this.modal.error.open = true;
                return;
            }

            for (const stock of this.withdrawalItems) {
                try {
                    await this.$store.dispatch('api/stock/addStock', {
                        name: stock.name,
                        set_id: stock.set_id,
                        up_price: stock.up_price,
                        low_price: stock.low_price,
                        dividend_amount: stock.dividend_amount,
                        closing_price: stock.closing_price,
                        comment: stock.comment,
                        comment_two: stock.comment_two,
                        emp_id: this.$auth.user.no,
                        created_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        updated_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    });
                } catch (error) {
                    console.error('Error adding stock:', error);
                    if (error.response && error.response.status === 400) {
                        this.modal.error.message = `มีชื่อหุ้นนี้ในระบบแล้ว : ${stock.name}`;
                        this.modal.error.open = true;
                        return;
                    }
                }
            }

            this.modal.complete.message = 'เพิ่มหุ้นเรียบร้อยแล้ว!';
            this.modal.complete.open = true;
            this.recordLog();
            this.showModalResult = false;
        },

        findDuplicateIds(stocks) {
            const names = stocks.map(stock => stock.name);
            return names.filter((name, index) => names.indexOf(name) !== index && name);
        },

        async fetchSetsData() {
            try {
                const response = await this.$store.dispatch('api/set/getSets');
                if (response) {
                    this.sets = response.map(item => ({ id: item.no, name: item.set }));
                }
            } catch (error) {
                console.error('Error fetching sets:', error);
            }
        },

        addProduct() {
            this.withdrawalItems.push({
                name: '',
                set_id: null,
                up_price: null,
                low_price: null,
                dividend_amount: null,
                closing_price: null,
                comment: null,
                comment_two: null,
            });
        },

        removeProduct(index) {
            this.withdrawalItems.splice(index, 1);
        },

        goBack() {
            this.$router.push('/developer/stock/management');
        },

        recordLog() {
            const details = this.withdrawalItems.map((item, index) => {
                const setName = this.sets.find(set => set.id === item.set_id)?.name || 'ยังไม่ระบุ';
                return `STOCK ${index + 1}\nNAME ${item.name}\nTYPE ${setName}\nDIVIDEND ${item.dividend_amount}\nCLOSE ${item.closing_price}\nCOMMENT ${item.comment}`;
            }).join('\n\n');

            const log = {
                emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
                emp_email: this.$auth.user.email,
                detail: details.trim(),
                type: 2,
                picture: this.$auth.user.picture || 'Unknown',
                action: 'เพิ่มหุ้น',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };

            this.$store.dispatch('api/log/addLogs', log);
        },

        goToStocksManagement() {
            this.$router.push('/developer/stock/management');
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
