export const actions = {
    async getDetails({ getters }, data) {
        return await this.$axios
            .get('detail', data)
            .then((res) => res.data)
    },
    async getDetail({ getters }, no) {
        return await this.$axios
            .get(`detail/${no}`)
            .then((res) => res.data)
    },
    async addDetail({ getters }, data) {
        return await this.$axios
            .post('detail', data)
            .then((res) => res.data)
    },
    async updateDetail({ getters }, data) {
        return await this.$axios
            .$put(`detail/update-detail/${data.no}`, data)
            .then((res) => res.data)
    },
    async deleteDetail({ getters }, no) {
        return await this.$axios
            .delete(`detail/${no}`)
            .then((res) => res.data)
    }
}