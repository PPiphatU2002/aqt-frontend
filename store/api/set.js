export const actions = {
    async getSets({ getters }, data) {
        return await this.$axios
            .get('set', data)
            .then((res) => res.data)
    },
    async getSet({ getters }, no) {
        return await this.$axios
            .get(`set/${no}`)
            .then((res) => res.data)
    },
    async addSet({ getters }, data) {
        return await this.$axios
            .post('set', data)
            .then((res) => res.data)
    },
    async updateSet({ getters }, data) {
        return await this.$axios
            .$put(`set/update-set/${data.no}`, data)
            .then((res) => res.data)
    },
    async deleteSet({ getters }, no) {
        return await this.$axios
            .delete(`set/${no}`)
            .then((res) => res.data)
    }
}