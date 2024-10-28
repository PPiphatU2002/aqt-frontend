export const actions = {
    async getTransactions({ getters }, data) {
        return await this.$axios
            .get('transaction', data)
            .then((res) => res.data)
    },
    async getTransaction({ getters }, no) {
        return await this.$axios
            .get(`transaction/${no}`)
            .then((res) => res.data)
    },
    async addTransaction({ getters }, data) {
        return await this.$axios
            .post('transaction', data)
            .then((res) => res.data)
    },
    async updateTransaction({ getters }, data) {
        return await this.$axios
            .$put(`transaction/update-transaction/${data.no}`, data)
            .then((res) => res.data)
    },
    async deleteTransaction({ getters }, no) {
        return await this.$axios
            .delete(`transaction/${no}`)
            .then((res) => res.data)
    }
}