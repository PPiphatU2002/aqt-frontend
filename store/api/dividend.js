export const actions = {
    async getDividends({ getters }, data) {
        return await this.$axios
            .get('dividend', data)
            .then((res) => res.data)
    },
    async getDividend({ getters }, no) {
        return await this.$axios
            .get(`dividend/${no}`)
            .then((res) => res.data)
    },
    async addDividend({ getters }, data) {
        return await this.$axios
            .post('dividend', data)
            .then((res) => res.data)
    },
    async updateDividend({ getters }, data) {
        return await this.$axios
            .$put(`dividend/update-dividend/${data.no}`, data)
            .then((res) => res.data)
    },
    async deleteDividend({ getters }, no) {
        return await this.$axios
            .delete(`dividend/${no}`)
            .then((res) => res.data)
    }
}