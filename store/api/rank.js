export const actions = {
    async getRanks({ getters }, data) {
        return await this.$axios
        .get('rank', data)
        .then((res) => res.data)
        },
    async getRank({ getters }, no) {
        return await this.$axios
        .get(`rank/${no}`)
        .then((res) => res.data)
        },
    async addRank({ getters }, data) {
        return await this.$axios
        .post('rank', data)
        .then((res) => res.data)
        },
    async updateRank({ getters }, data) {
        return await this.$axios
        .put(`rank/${data.no}`, data)
        .then((res) => res.data)
        },
    async deleteRank({ getters }, no) {
        return await this.$axios
        .delete(`rank/${no}`)
        .then((res) => res.data)
        }
}