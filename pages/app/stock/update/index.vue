<template>
    <div>
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" />
        <button @click="fetchCSVData" :disabled="isLoading">
            <v-icon>mdi-upload</v-icon>อัพเดทราคาปิด
        </button>
        <UpdateClosePrice :open.sync="isLoading" :progressPercentage="progressPercentage" @cancel-fetch="cancelFetch" />
        <v-data-table v-if="csvData.length > 0" :headers="headers" :items="csvData" class="elevation-1"></v-data-table>
        <button @click="saveClosingPrices" :disabled="csvData.length === 0 || isLoading">
            <v-icon>mdi-content-save</v-icon>บันทึก
        </button>
    </div>
</template>

<script>
import Papa from 'papaparse';
import moment from 'moment'; // อย่าลืมตรวจสอบการนำเข้า moment

export default {
    layout: 'user',
    middleware: 'auth',
    data() {
        return {
            modal: {
                complete: {
                    open: false,
                    message: ''
                },
            },
            csvData: [],
            headers: [
                { text: 'Datetime', value: 'datetime' },
                { text: 'Symbol', value: 'symbol' },
                { text: 'Close', value: 'close' }
            ],
            isLoading: false,
            progressPercentage: 0,
            xhr: null, // ตัวแปรสำหรับเก็บ XMLHttpRequest
        };
    },
    methods: {
        fetchCSVData() {
            this.isLoading = true;
            this.progressPercentage = 0;

            this.xhr = new XMLHttpRequest();
            this.xhr.open('GET', 'http://localhost:3001/run-closeprice', true);
            this.xhr.responseType = 'blob';

            this.xhr.onprogress = (event) => {
                if (event.lengthComputable) {
                    const total = event.total;
                    const current = event.loaded;
                    this.progressPercentage = Math.floor((current / total) * 100);
                    console.log(`โหลด: ${current}, รวม: ${total}, เปอร์เซ็นต์: ${this.progressPercentage}%`);
                }
            };

            this.xhr.onload = () => {
                if (this.xhr.status === 200) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const text = event.target.result;
                        this.parseCSVData(text);
                        this.isLoading = false;
                        this.progressPercentage = 100;
                    };
                    reader.readAsText(this.xhr.response);
                } else {
                    this.isLoading = false;
                    alert('เกิดข้อผิดพลาดในการดึงไฟล์ กรุณาลองใหม่อีกครั้ง');
                }
            };

            this.xhr.onerror = () => {
                this.isLoading = false;
                alert('เกิดข้อผิดพลาดทางเครือข่าย กรุณาลองใหม่อีกครั้ง');
            };

            this.xhr.send(); // ส่งคำขอ
        },

        cancelFetch() {
            if (this.xhr) {
                this.xhr.abort();
                this.xhr = null;
            }
            this.isLoading = false;
            this.progressPercentage = 0;

            fetch('http://localhost:3001/cancel-closeprice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(message => console.log(message))
                .catch(error => console.error('Error canceling operation:', error));
        },

        parseCSVData(data) {
            Papa.parse(data, {
                header: true,
                complete: (results) => {
                    this.csvData = results.data.map(item => ({
                        datetime: item.datetime || '', 
                        symbol: item.symbol || '', 
                        close: item.close || ''       
                    }));
                },
            });
        },

        async saveClosingPrices() {
            if (this.csvData.length === 0) {
                alert('ไม่พบข้อมูลเพื่อบันทึก');
                return;
            }

            try {
                for (const stock of this.csvData) {
                    const stockData = JSON.parse(JSON.stringify(stock));
                    const symbol = stockData.symbol;
                    const closePrice = stockData.close;

                    // ตรวจสอบให้แน่ใจว่ามีค่าที่ถูกต้องก่อนส่งคำขอ
                    if (!symbol || !closePrice) {
                        continue;
                    }

                    await this.$store.dispatch('api/stock/updateClosePriceByName', {
                        emp_id: this.$auth.user.no,
                        name: symbol,
                        closing_price: closePrice
                    });
                }

                this.modal.complete.open = true;
                this.modal.complete.message = 'บันทึกข้อมูลเรียบร้อยแล้ว';
            } catch (error) {
                console.error('Error updating closing prices:', error);
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        },
    },
};
</script>
