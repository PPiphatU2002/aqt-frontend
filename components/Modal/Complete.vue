<template>
  <v-dialog persistent :retain-focus="false" v-model="open" max-width="300" max-height="300" content-class="rounded-xl"
    @keydown.esc="confirm">
    <v-card>
      <v-card-title class="d-flex align-center justify-center text-h6">
        <v-icon class="mr-3" color="#24b224" size="40">mdi-check-circle</v-icon>
        สำเร็จ
      </v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-card-text class="text-center">
        {{ message }}
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn color="#24b224" @click="confirm" class="rounded-xl font-weight-medium mt-0">
          ตกลง
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    method: { type: Function, default: null },
    open: {
      required: true,
    },
    message: {
      type: String,
    },
  },
  watch: {
    open(val) {
      if (val) {
        document.addEventListener('keydown', this.handleKeydown);
      } else {
        document.removeEventListener('keydown', this.handleKeydown);
      }
    },
  },
  data() {
    return {}
  },
  methods: {
    confirm() {
      if (this.method === null) {
        this.$emit('update:complete', false)
      } else {
        this.method()
        this.$emit('update:complete', false)
      }
    },
    handleKeydown(e) {
      if (e.key === 'Escape') {
        this.confirm();
      }
    },
  },
}
</script>
