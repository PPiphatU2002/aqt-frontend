export const actions = {
    async getProfile({ getters }, data) {
        return await this.$axios
        .get('file/profile', data)
        .then((res) => res.data)
    },    
    async viewProfile({ getters }, data) {
        return await this.$axios
        .get('file/profile/:picture', data)
        .then((res) => res.data)
    },
    async viewDefault({ getters }, data) {
        return await this.$axios
        .get('file/default/:picture', data)
        .then((res) => res.data)
    },
    async downloadProfile({ getters }, data) {
        return await this.$axios
        .get('file/profile/download/:picture', data)
        .then((res) => res.data)
    },
    async uploadProfile({ getters }, data) {
        return await this.$axios
        .post('file/profile', data)
        .then((res) => res.data)
    },
    async updateProfile({ getters }, data) {
        return await this.$axios
        .put('file/profile/update/:no', data)
        .then((res) => res.data)
    },
    async deleteProfile({ getters }, no) {
        return await this.$axios
        .delete(`file/profile/${no}`)
        .then((res) => res.data)
    },
}