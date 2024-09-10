export const actions = {
  async getEmployees({ getters }, data) {
    return await this.$axios
      .get('employee', data)
      .then((res) => res.data)
  },
  async getEmployee({ getters }, no) {
    return await this.$axios
      .get(`employee/${no}`)
      .then((res) => res.data)
  },
  async updateEmployee({ getters }, data) {
    return await this.$axios
      .$put(`employee/update-Employee/${data.no}`, data)
      .then((res) => res.data)
  },
  async updateEmployeeAll({ getters }, data) {
    return await this.$axios
      .put(`employee/update-employee-all/${data.no}`, data)
      .then((res) => res.data)
  },
  async deleteUser({ getters }, no) {
    return await this.$axios
      .delete(`Employee/${no}`)
      .then((res) => res.data)
  },
  async updatePassword({ getters }, data) {
    return await this.$axios
      .put(`employee/update-password/${data.no}`, data)
      .then((res) => res.data)
  },
  async register({ getters }, data) {
    return await this.$axios
      .post('auth/register', data)
      .then((res) => res.data)
  }
}