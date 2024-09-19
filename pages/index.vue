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
                    message: 'ผู้ใช้นี้ยังไม่ได้รับการอนุมัติ',
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
                        this.$router.push('/auth');
                    } else if (RankID === '2') {
                        this.$router.push('/auth');
                    } else if (RankID === '3') {
                        this.$router.push('/auth');
                    } else {
                        this.$router.push('/');
                    }
                }

            } else {
                this.$router.push('/');
            }
        },
    },
}

</script>