export const actions = {
    async getCommissions({ getters }, data) {
        return await this.$axios
            .get('commission', data)
            .then((res) => res.data)
    },
    async getCommission({ getters }, no) {
        return await this.$axios
            .get(`commission/${no}`)
            .then((res) => res.data)
    },
    async addCommission({ getters }, data) {
        return await this.$axios
            .post('commission', data)
            .then((res) => res.data)
    },
    async updateCommission({ getters }, data) {
        return await this.$axios
            .$put(`commission/update-commission/${data.no}`, data)
            .then((res) => res.data)
    },
    async deleteCommission({ getters }, no) {
        return await this.$axios
            .delete(`commission/${no}`)
            .then((res) => res.data)
    }
}