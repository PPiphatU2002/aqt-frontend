<template></template>

<script>
    export default {
        layout: 'employee',
        middleware: 'auth',
        async mounted() {
            await this.checkRank();
        },

        methods: {
        async checkRank() {
            if (this.$auth.loggedIn) {
            console.log(this.$auth.loggedIn)
            const rankId = this.$auth.user.ranks_id.toString();
            console.log('Ranks_id :',rankId)
            if (rankId === '1') {
                console.log('Welcome Back Developer!');
                this.$router.push('/developer/home');
            } else if (rankId === '2') {
                console.log('Welcome Back Employee!');
                this.$router.push('/employee/home');
            } else {
                console.log('You Can Not Access This Page!');
                this.$router.push('/auth');
            }
        } else {
            console.log('You Is Not Logged In!');
            this.$router.push('/auth');
        }
        },
    }
}
</script>