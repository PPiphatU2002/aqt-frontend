export const actions = {
    async getFroms({ getters }, data) {
        return await this.$axios
            .get('from', data)
            .then((res) => res.data)
    },
    async getFrom({ getters }, no) {
        return await this.$axios
            .get(`from/${no}`)
            .then((res) => res.data)
    },
    async addFrom({ getters }, data) {
        return await this.$axios
            .post('from', data)
            .then((res) => res.data)
    },
    async updateFrom({ getters }, data) {
        return await this.$axios
            .$put(`from/update-from/${data.no}`, data)
            .then((res) => res.data)
    },
    async deleteFrom({ getters }, no) {
        return await this.$axios
            .delete(`from/${no}`)
            .then((res) => res.data)
    }
}