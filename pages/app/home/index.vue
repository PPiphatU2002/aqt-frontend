<template>

    <div>
        <v-container class="fill-height" fluid justify="center" align="center">
            <v-row justify="center">
                <v-col cols="12" sm="8" md="4" :style="{ marginTop: '10vh' }">
                    <v-row justify="center">
                        <v-col cols="12" class="d-flex justify-center">
                            <v-btn color="#24b224" @click="fixport"
                                :style="{ fontSize: '20px', height: '60px', width: '150%', marginBottom: '15px' }">
                                ข้อมูลหุ้นของลูกค้า
                            </v-btn>
                        </v-col>

                        <v-col cols="12" class="d-flex justify-center">
                            <v-btn color="#24b224" @click="transaction"
                                :style="{ fontSize: '20px', height: '60px', width: '150%', marginBottom: '15px' }">
                                ซื้อหุ้น
                            </v-btn>
                        </v-col>

                        <v-col cols="12" class="d-flex justify-center">
                            <v-btn color="#24b224" @click="management"
                                :style="{ fontSize: '20px', height: '60px', width: '150%' }">
                                ขายหุ้น
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </div>
    
</template>


<script>

export default {

    layout: 'user',
    middleware: 'auth',

    async mounted() {
        await this.checkRank();
    },

    methods: {
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
                        this.$router.push('/app/home');
                    } else if (RankID === '2') {
                        this.$router.push('/app/home');
                    } else if (RankID === '3') {
                        this.$router.push('/app/home');
                    } else {
                        this.$router.push('/auth');
                    }
                }
            } else {
                this.$router.push('/auth');
            }
        },

        fixport() {
            this.$router.push('/app/transaction/customer_stock');
        },

        transaction() {
            this.$router.push('/app/transaction/buy');
        },

        management() {
            this.$router.push('/app/transaction/sale');
        },
    }
}

</script>
