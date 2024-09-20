export const actions = {
    async getTypes({ getters }, data) {
        return await this.$axios
            .get('type', data)
            .then((res) => res.data)
    },
    async getType({ getters }, no) {
        return await this.$axios
            .get(`type/${no}`)
            .then((res) => res.data)
    },
    async addType({ getters }, data) {
        return await this.$axios
            .post('type', data)
            .then((res) => res.data)
    },
    async updateType({ getters }, data) {
        return await this.$axios
            .$put(`type/update-type/${data.no}`, data)
            .then((res) => res.data)
    },
    async deleteType({ getters }, no) {
        return await this.$axios
            .delete(`type/${no}`)
            .then((res) => res.data)
    }
}