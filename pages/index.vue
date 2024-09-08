<template>
    <div>
        <ModalWarning :open="modal.warning.open" :message="modal.warning.message" :warning.sync="modal.warning.open" />
    </div>
</template>

<script>
import moment from 'moment';
moment.locale('th');

export default {
    layout: 'default',

    async mounted() {
        await this.checkRank();
    },

    data() {
        return {
            modal: {
                warning: {
                    open: false,
                    message: 'THIS USER HAS NOT BEEN APPROVED YET!',
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
                    this.$router.push('/');
                    this.modal.warning.open = true;
                    await this.$auth.logout();
                }
                else {
                    if (RankID === '1') {
                        console.log('Welcome Back Developer!');
                        this.$router.push('/auth');
                    } else if (RankID === '2') {
                        console.log('Welcome Back Employee!');
                        this.$router.push('/auth');
                    } else {
                        console.log('You Can Not Access This Page!');
                        this.$router.push('/');
                    }
                }

            } else {
                console.log('User Is Not Logged In!');
                this.$router.push('/');
            }
        },
    },
}
</script>