<template>
    <div>
        <ModalWarning :open="modal.warning.open" :message="modal.warning.message" :warning.sync="modal.warning.open" />
        <v-container class="fill-height" fluid justify="center" align="center">
            <v-row justify="center">
                <v-col cols="12" sm="8" md="4" :style="{ marginTop: '10vh' }">
                    <v-row justify="center">
                        <v-col cols="12" class="d-flex justify-center">
                            <v-btn color="#85d7df" @click="fixport"
                                :style="{ fontSize: '20px', height: '60px', width: '150%', marginBottom: '15px' }">
                                FIX PORT MANAGEMENT
                            </v-btn>
                        </v-col>

                        <v-col cols="12" class="d-flex justify-center">
                            <v-btn color="#85d7df" @click="transaction"
                                :style="{ fontSize: '20px', height: '60px', width: '150%', marginBottom: '15px' }">
                                TRANSACTION MANAGEMENT
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
    layout: 'employee',
    middleware: 'auth',
    async mounted() {
        await this.checkRank();
    },

    data() {
        return {
            modal: {
                warning: {
                    open: false,
                    message: 'THE USER HAS NOT APPROVED IT!',
                },
            },
        }
    },

    methods: {
        async checkRank() {
            if (this.$auth.loggedIn) {
                const Status = this.$auth.user.status.toString();
                const RankID = this.$auth.user.ranks_id.toString();
                if (Status === '2') {
                    this.$router.push('/auth');
                }
                else {
                    if (RankID === '1') {
                        console.log('Welcome Back Developer!');
                        this.$router.push('/developer/transaction/management');
                    } else if (RankID === '2') {
                        console.log('Welcome Back Employee!');
                        this.$router.push('/employee/transaction/management');
                    } else {
                        console.log('You Can Not Access This Page!');
                        this.$router.push('/auth');
                    }
                }
            } else {
                console.log('User Is Not Logged In!');
                this.$router.push('/auth');
            }
        },

        fixport() {
            this.$router.push('/developer/transaction/fixport');
        },
        transaction() {
            this.$router.push('/developer/transaction/transaction');
        },
        management() {
            this.$router.push('/developer/transaction/management');
        },
    }
}
</script>
