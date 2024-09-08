export const actions = {
    async getLogs({ getters }, data) {
        return await this.$axios
            .get('log', data)
            .then((res) => res.data)
    },
    async getLogsID({ getters }, data) {
        return await this.$axios
            .get('log/:no', data)
            .then((res) => res.data)
    },
    async getLogsType({ getters }, no) {
        return await this.$axios
            .get(`log/type/${no}`)
            .then((res) => res.data)
    },
    async addLogs({ getters }, data) {
        return await this.$axios
            .post('log', data)
            .then((res) => res.data)
    },
}