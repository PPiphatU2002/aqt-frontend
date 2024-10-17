<template>
    <div>
        <ModalComplete :open="modal.complete.open" :message="modal.complete.message"
            :complete.sync="modal.complete.open" :method="goBack" />
        <UpdateClosePrice :open.sync="isLoadingClosePrice" @cancel-fetch="cancelFetchClosePriceData" />
        <UpdateDividendYield :open.sync="isLoadingDividendYield" @cancel-fetch="cancelFetchDividendYieldData" />
        <v-card class="custom-card" flat>
            <v-container>
                <v-row justify="center" align="center">
                    <v-col cols="auto">
                        <v-card-title class="d-flex align-center justify-center">
                            <v-icon class="little-icon" color="#85d7df">mdi-archive-arrow-up</v-icon>&nbsp;
                            <h3>อัพเดทหุ้น</h3>
                        </v-card-title>
                    </v-col>
                </v-row>
            </v-container>

            <v-row justify="center">
                <v-col cols="auto">
                    <v-btn color="#ffc800" @click="fetchClosePriceData" :disabled="isLoadingClosePrice" class="mr-2">
                        <v-icon>mdi-upload</v-icon>อัพเดทราคาปิด
                    </v-btn>
                    <v-btn color="#38b6ff" @click="fetchDividendYieldData" :disabled="isLoadingDividendYield"
                        class="mr-2">
                        <v-icon>mdi-upload</v-icon>อัพเดทจำนวนปันผล
                    </v-btn>
                </v-col>
            </v-row>

            <v-data-table v-if="true" :headers="isDataLoaded ? headers : []" :items="csvData" class="mt-4 elevation-1"
                :items-per-page="5"></v-data-table>

            <v-row justify="center" class="mt-4">
                <v-col cols="auto">
                    <v-btn color="#24b224" @click="saveUpdate" :disabled="csvData.length === 0 || isLoadingClosePrice">
                        <v-icon>mdi-content-save</v-icon>บันทึก
                    </v-btn>
                    <v-btn class="ml-2" color="#e50211" @click="goToHome">
                        <v-icon>mdi-home</v-icon>กลับไปหน้าหลัก
                    </v-btn>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>

<script>
import Papa from 'papaparse';
import moment from 'moment'; // อย่าลืมตรวจสอบการนำเข้า moment

export default {
    layout: 'user',
    middleware: 'auth',
    async mounted() {
        await this.checkRank();
    },
    data() {
        return {
            modal: {
                complete: {
                    open: false,
                    message: ''
                },
            },
            csvData: [],
            headers: [],
            isLoadingClosePrice: false,
            isLoadingDividendYield: false,
            isDataLoaded: false, // Flag เพื่อควบคุมการแสดง headers
            xhr: null,
        };
    },
    methods: {
        goBack() {
            window.location.reload();
        },

        goToHome() {
            this.$router.push('/app/home');
        },

        async checkRank() {
            if (this.$auth.loggedIn) {
                const Status = this.$auth.user.status.toString();
                const RankID = this.$auth.user.ranks_id.toString();
                if (Status === '2') {
                    this.$router.push('/');
                    await this.$auth.logout();
                }
                else {
                    if (RankID === '1') {
                        this.$router.push('/app/stock/update');
                    } else if (RankID === '2') {
                        this.$router.push('/app/home');
                    } else if (RankID === '3') {
                        this.$router.push('/app/stock/update');
                    } else {
                        this.$router.push('/auth');
                    }
                }
            } else {
                this.$router.push('/');
            }
        },

        fetchClosePriceData() {
            this.isLoadingClosePrice = true;
            this.headers = [ // ตั้งค่า headers สำหรับราคาปิด
                { text: 'เวลา', value: 'datetime' },
                { text: 'ชื่อหุ้น', value: 'symbol' },
                { text: 'ราคาปิด', value: 'close' }
            ];

            this.xhr = new XMLHttpRequest();
            this.xhr.open('GET', 'http://localhost:3001/run-close-price', true);
            this.xhr.responseType = 'blob';

            this.xhr.onload = () => {
                if (this.xhr.status === 200) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const text = event.target.result;
                        this.parseClosePriceData(text);
                        this.isLoadingClosePrice = false;
                        this.isDataLoaded = true; // ตั้งค่า flag เป็น true หลังจากโหลดข้อมูลเสร็จ
                    };
                    reader.readAsText(this.xhr.response);
                } else {
                    this.isLoadingClosePrice = false;
                    alert('เกิดข้อผิดพลาดในการดึงไฟล์ กรุณาลองใหม่อีกครั้ง');
                }
            };

            this.xhr.onerror = () => {
                this.isLoadingClosePrice = false;
                alert('เกิดข้อผิดพลาดทางเครือข่าย กรุณาลองใหม่อีกครั้ง');
            };

            this.xhr.send();
        },

        cancelFetchClosePriceData() {
            if (this.xhr) {
                this.xhr.abort();
                this.xhr = null;
            }
            this.isLoadingClosePrice = false;

            fetch('http://localhost:3001/cancel-close-price', {
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

        fetchDividendYieldData() {
            this.isLoadingDividendYield = true;
            this.headers = [ // ตั้งค่า headers สำหรับจำนวนปันผล
                { text: 'ปี', value: 'year' },
                { text: 'ชื่อหุ้น', value: 'symbol' },
                { text: 'จำนวนปันผล', value: 'dividend' },
                { text: 'หมายเหตุ', value: 'remark' }
            ];

            this.xhr = new XMLHttpRequest();
            this.xhr.open('GET', 'http://localhost:3001/run-dividend-yield', true);
            this.xhr.responseType = 'blob';

            this.xhr.onload = () => {
                if (this.xhr.status === 200) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const text = event.target.result;
                        this.parseDividendYieldData(text);
                        this.isLoadingDividendYield = false;
                        this.isDataLoaded = true; // ตั้งค่า flag เป็น true หลังจากโหลดข้อมูลเสร็จ
                    };
                    reader.readAsText(this.xhr.response);
                } else {
                    this.isLoadingDividendYield = false;
                    alert('เกิดข้อผิดพลาดในการดึงไฟล์ กรุณาลองใหม่อีกครั้ง');
                }
            };

            this.xhr.onerror = () => {
                this.isLoadingDividendYield = false;
                alert('เกิดข้อผิดพลาดทางเครือข่าย กรุณาลองใหม่อีกครั้ง');
            };

            this.xhr.send();
        },

        cancelFetchDividendYieldData() {
            if (this.xhr) {
                this.xhr.abort();
                this.xhr = null;
            }
            this.isLoadingDividendYield = false;

            fetch('http://localhost:3001/cancel-dividend-yield', {
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

        parseClosePriceData(data) {
            Papa.parse(data, {
                header: true,
                complete: (results) => {
                    this.csvData = results.data
                        .filter(item => item.datetime && item.symbol && item.close)
                        .map(item => ({
                            datetime: item.datetime || '',
                            symbol: item.symbol || '',
                            close: item.close || ''
                        }));
                },
            });
        },

        parseDividendYieldData(data) {
            Papa.parse(data, {
                header: true,
                complete: (results) => {
                    const latestData = {};

                    results.data.forEach(item => {
                        const symbol = item.symbol;
                        const year = parseInt(item.year);
                        const dividend = item.dividend;
                        const remark = item.remark; // Extract the remark

                        if (symbol && !isNaN(year) && dividend) {
                            if (!latestData[symbol] || year > latestData[symbol].year) {
                                latestData[symbol] = { year: year, dividend: dividend, remark: remark }; // Store remark
                            }
                        }
                    });

                    // Convert object back to array for v-data-table
                    this.csvData = Object.keys(latestData).map(symbol => ({
                        year: latestData[symbol].year,
                        symbol: symbol,
                        dividend: latestData[symbol].dividend,
                        remark: latestData[symbol].remark, // Include remark in the output
                    }));

                    this.isLoadingDividendYield = false;
                    this.isDataLoaded = true;
                },
            });
        },

        async saveUpdate() {
            if (this.csvData.length === 0) {
                alert('ไม่พบข้อมูลเพื่อบันทึก');
                return;
            }

            try {
                for (const stock of this.csvData) {
                    const stockData = JSON.parse(JSON.stringify(stock));
                    const symbol = stockData.symbol;

                    // ตรวจสอบให้แน่ใจว่ามีค่าที่ถูกต้องก่อนส่งคำขอ
                    if (!symbol) {
                        continue;
                    }

                    // ตรวจสอบว่าเป็นข้อมูล ClosePrice หรือ DividendYield
                    if (stockData.close !== undefined) {
                        const closePrice = stockData.close;
                        await this.$store.dispatch('api/stock/updateClosePriceByName', {
                            emp_id: this.$auth.user.no,
                            name: symbol,
                            closing_price: closePrice
                        });
                    }

                    if (stockData.dividend !== undefined) {
                        const dividend = stockData.dividend;
                        const remark = stockData.remark; // Get the remark from stockData

                        await this.$store.dispatch('api/stock/updateDividendYieldByName', {
                            emp_id: this.$auth.user.no,
                            name: symbol,
                            dividend_amount: dividend,
                            comment: remark // Include the remark in the payload
                        });
                    }
                }

                this.modal.complete.open = true;
                this.modal.complete.message = 'บันทึกข้อมูลเรียบร้อยแล้ว';
            } catch (error) {
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        }
    },
};
</script>

<style scoped>
.little-icon {
    font-size: 3rem;
    margin-right: 8px;
    margin-left: 8px;
}

.custom-card {
    max-width: 800px;
    width: 100%;
    margin: auto;
}
</style>
