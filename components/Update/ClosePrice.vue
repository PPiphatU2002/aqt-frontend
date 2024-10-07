<template>
    <v-dialog persistent v-model="open" max-width="300" max-height="300" content-class="rounded-xl">
        <v-card class="d-flex flex-column justify-space-between" 
            style="min-height: 200px;">
            
            <div class="d-flex justify-center mt-3" style="text-align: center; padding: 0 15px;">
                <v-icon>mdi-loading</v-icon>กำลังดาวน์โหลดข้อมูล...
            </div>

            <div class="d-flex justify-center mt-0">
                <img src="http://localhost:3001/file/default/Loading.gif" alt="Loading" width="150" />
            </div>

            <v-card-actions class="justify-center mb-2">
                <v-btn color="#e50211" @click="cancel" class="rounded-xl font-weight-medium" style="color: white;">
                    ยกเลิก
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        open: { required: true },
    },

    methods: {
        cancel() {
            this.$emit("update:open", false);
            this.$emit("cancel-fetch");
        },
    },
};
</script>
