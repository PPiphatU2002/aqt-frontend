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
                                ข้อมูลการซื้อขายหุ้นของลูกค้า
                            </v-btn>
                        </v-col>

                        <v-col cols="12" class="d-flex justify-center">
                            <v-btn color="#24b224" @click="goToStocksFollowManagement"
                                :style="{ fontSize: '20px', height: '60px', width: '150%', marginBottom: '15px' }">
                                <v-icon v-if="pendingEmployeesCount > 0" class="small-bell-icon"
                                    style="margin-right: 6px;">mdi-bell</v-icon>
                                ข้อมูลการติดตามหุ้น<v-icon v-if="pendingEmployeesCount > 0" class="small-bell-icon"
                                    style="margin-left: 6px;">mdi-bell</v-icon>
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
        await this.fetchPendingEmployeeCount();
    },

    data() {
        return {
            pendingEmployeesCount: 0,
        };
    },

    methods: {
        async fetchPendingEmployeeCount() {
            try {
                const response = await this.$store.dispatch('api/employee/getEmployeesStatus', '2');
                this.pendingEmployeesCount = response.length;
            } catch (error) {
                console.error('Error fetching pending employees:', error);
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
            this.$router.push('/app/transaction/customer_trade');
        },

        goToStocksFollowManagement() {
            this.$router.push('/app/stock/stock_follow');
        },
    }
}

</script>

<style scoped>
@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
}

.small-bell-icon {
  font-size: 1.2rem;
  vertical-align: middle;
  color: #ffc800;
  animation: shake 0.8s ease infinite;
}
</style>
