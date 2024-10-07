<template>
    <div>
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <ModalError :open="modal.error.open" :message="modal.error.message" :error.sync="modal.error.open" />
        <ResultCustomer :open="showModalResult" :customers="withdrawalItems" :types="types" :bases="bases"
            @confirm="confirmAndAddCustomers" @cancel="showModalResult = false" />

        <v-card class="custom-card" flat>
            <v-card-title class="d-flex align-center justify-center">
                <v-icon class="little-icon" color="#24b224">mdi-account-plus</v-icon> &nbsp;
                <h3 class="mb-0">ลูกค้าใหม่</h3>
            </v-card-title>

            <v-card-text>
                <v-form>
                    <v-row v-for="(item, index) in withdrawalItems" :key="index" align="center">
                        <v-col cols="3" class="ml-2">
                            <v-text-field v-model="item.numericId" @input="setFullId(item)" label="ไอดีลูกค้า"
                                type="text" dense outlined prepend="AQT" :rules="[
                                    (v) => !!v || 'กรุณากรอกตัวเลขเท่านั้น',
                                    (v) => /^(AQT)?[0-9]{9}$/.test(v) || 'กรุณากรอกข้อมูลให้ถูกต้อง'
                                ]" maxlength="12" />
                        </v-col>

                        <v-col cols="2">
                            <v-text-field v-model="item.nickname" label="ชื่อเล่น" type="text" dense outlined
                                :rules="[(v) => !!v || 'กรุณากรอกชื่อเล่น', (v) => /^[\u0E00-\u0E7F]+$/.test(v) || 'กรุณากรอกเฉพาะภาษาไทย']"></v-text-field>
                        </v-col>

                        <v-col cols="2">
                            <v-select v-model="item.type_id" :items="types" item-text="name" item-value="id"
                                label="ประเภท" dense outlined></v-select>
                        </v-col>

                        <v-col cols="2">
                            <v-select v-model="item.base_id" :items="bases" item-text="name" item-value="id"
                                label="ฐานทุน" dense outlined></v-select>
                        </v-col>

                        <v-col cols="2" class="d-flex align-center">
                            <v-btn icon color="#e50211" @click="removeProduct(index)" class="mb-6">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                            <v-btn color="#24b224" @click="addProduct" text class="mb-6 ml-2">
                                <v-icon left>mdi-account-plus</v-icon> เพิ่มลูกค้า
                            </v-btn>
                        </v-col>
                    </v-row>

                    <div class="text-center">
                        <v-btn color="#24b224" @click="showModalResult = true" :disabled="!isFormValid" class="mr-2">
                            บันทึก
                        </v-btn>
                        <v-btn color="#e50211" @click="goToManagement">
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
        await this.fetchTypesData()
        await this.fetchBasesData()
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
            withdrawalItems: [{ id: 'AQT', nickname: '', type_id: null, base_id: null }],
            types: [],
            bases: [],

        }
    },

    computed: {
        isFormValid() {
            return this.withdrawalItems.every(item =>
                this.isIdValid(item.numericId) &&
                this.isNicknameValid(item.nickname)
            );
        },
    },

    methods: {
        isIdValid(numericId) {
            return !!numericId && /^(AQT)?[0-9]{9}$/.test(numericId);
        },

        isNicknameValid(nickname) {
            return !!nickname && /^[\u0E00-\u0E7F]+$/.test(nickname);
        },

        setFullId(item) {
            if (!item.numericId.startsWith('AQT')) {
                item.id = 'AQT' + item.numericId;
            } else {
                item.id = item.numericId;
            }
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
                        this.$router.push('/developer/user/new');
                    } else if (RankID === '2') {
                        this.$router.push('/employee/user/new');
                    } else if (RankID === '3') {
                        this.$router.push('/admin/user/new');
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
                this.modal.error.message = `มีไอดีซ้ำ : ${duplicateIds.join(', ')}`;
                this.modal.error.open = true;
                return;
            }

            for (const customer of this.withdrawalItems) {
                try {
                    await this.$store.dispatch('api/customer/addCustomer', {
                        id: customer.id,
                        nickname: customer.nickname,
                        type_id: customer.type_id,
                        base_id: customer.base_id,
                        emp_id: this.$auth.user.no,
                        created_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        updated_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    });
                } catch (error) {
                    console.error('Error adding customer:', error);
                    if (error.response && error.response.status === 400) {
                        this.modal.error.message = `มีไอดีนี้ในระบบแล้ว : ${customer.id}`;
                        this.modal.error.open = true;
                        return;
                    }
                }
            }

            this.modal.complete.message = 'เพิ่มลูกค้าเรียบร้อยแล้ว!';
            this.modal.complete.open = true;
            this.recordLog();
            this.showModalResult = false;
        },

        findDuplicateIds(customers) {
            const ids = customers.map(customer => customer.id);
            return ids.filter((id, index) => ids.indexOf(id) !== index && id);
        },

        async fetchTypesData() {
            try {
                const response = await this.$store.dispatch('api/type/getTypes');
                if (response) {
                    this.types = response.map(item => ({ id: item.no, name: item.type }));
                }
            } catch (error) {
                console.error('Error fetching types:', error);
            }
        },

        async fetchBasesData() {
            try {
                const response = await this.$store.dispatch('api/base/getBases');
                if (response) {
                    this.bases = response.map(item => ({ id: item.no, name: item.base }));
                }
            } catch (error) {
                console.error('Error fetching types:', error);
            }
        },

        addProduct() {
            this.withdrawalItems.push({
                id: null,
                nickname: '',
                type_id: null,
                base_id: null,
            });
        },

        removeProduct(index) {
            this.withdrawalItems.splice(index, 1);
        },

        goBack() {
            this.$router.push('/developer/user/management');
        },

        recordLog() {
            const details = this.withdrawalItems.map((item, index) => {
                const typeName = this.types.find(type => type.id === item.type_id)?.name || 'ยังไม่ระบุ';
                const baseName = this.bases.find(base => base.id === item.base_id)?.name || 'ยังไม่ระบุ';
                return `USER ${index + 1}\nID ${item.id}\nNICKNAME ${item.nickname}\nTYPE ${typeName}\nBASE ${baseName}`;
            }).join('\n\n');

            const log = {
                emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
                emp_email: this.$auth.user.email,
                detail: details.trim(),
                type: 3,
                picture: this.$auth.user.picture || 'Unknown',
                action: 'เพิ่มลูกค้าใหม่',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };

            this.$store.dispatch('api/log/addLogs', log);
        },

        goToManagement() {
            this.$router.push('/developer/user/management');
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
