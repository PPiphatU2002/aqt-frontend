<template>
  <v-dialog persistent :retain-focus="false" v-model="open" max-width="400" max-height="200" content-class="rounded-xl"
    @keydown.esc="cancel" @keydown.enter="confirm">
    <v-card>
      <v-card-title class="d-flex align-center justify-center text-h6">
        <v-icon justify="center" class="mr-3" size="40" color="#e50211">mdi-lock-question</v-icon>
        คุณต้องการเปลี่ยนรหัสผ่านหรือไม่?
      </v-card-title>
      <v-divider class="mb-3"></v-divider>

      <v-card-actions class="justify-center">
        <v-btn color="#24b224" @click="confirm" class="rounded-xl font-weight-medium mt-0">
          ตกลง
        </v-btn>
        <v-btn color="#e50211" @click="cancel" class="rounded-xl font-weight-medium mt-0">
          ยกเลิก
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    open: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    confirm() {
      this.$emit('confirm');
      this.$emit('update:open', false);
    },
    cancel() {
      this.$emit('update:open', false);
    },
  },
}
</script>
