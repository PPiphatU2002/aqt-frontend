export const actions = {
    async getLogs({ getters }, data) {
        return await this.$axios
        .get('logs', data)
        .then((res) => res.data)
    },
    async getLogsID({ getters }, data) {
        return await this.$axios
        .get('logs/:no', data)
        .then((res) => res.data)
    },
    async getLogsType({ getters }, no) {
        return await this.$axios
        .get(`logs/type/${no}`)
        .then((res) => res.data)
    },
    async addLogs({ getters }, data) {
        return await this.$axios
        .post('logs', data)
        .then((res) => res.data)
    },
}