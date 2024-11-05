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
                    <v-btn color="#ffc800" @click="fetchClosePriceData"
                        :disabled="isLoadingClosePrice || csvData.length > 0" class="mr-2">
                        <v-icon>mdi-upload</v-icon>อัพเดทราคาปิด
                    </v-btn>
                    <v-btn color="#38b6ff" @click="fetchDividendYieldData"
                        :disabled="isLoadingDividendYield || csvData.length > 0" class="mr-2">
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
import moment from 'moment-timezone';

export default {
    layout: 'user',
    middleware: 'auth',

    async mounted() {
        await this.checkRank();
        await this.fetchStockData();
    },

    data() {
        return {
            modal: {
                complete: {
                    open: false,
                    message: ''
                },
            },
            stocks: [],
            csvData: [],
            headers: [],
            isLoadingClosePrice: false,
            isLoadingDividendYield: false,
            isDataLoaded: false, // Flag เพื่อควบคุมการแสดง headers
            xhr: null,
        };
    },
    methods: {
        async fetchStockData() {
            this.stocks = await this.$store.dispatch('api/stock/getStocks');
        },

        getStockByName(stockName) {
            return this.stocks.find(stock => stock.name === stockName);
        },

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
                { text: 'วันที่', value: 'xdate' },
                { text: 'ชื่อหุ้น', value: 'symbol' },
                { text: 'จำนวนปันผล', value: 'dividend' },
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

        async parseDividendYieldData(data) {
            try {
                // เรียกดูข้อมูลที่มีอยู่ในฐานข้อมูล
                const existingDividends = await this.$store.dispatch('api/dividend/getDividends', {
                    x_date: moment().tz('Asia/Bangkok').format('YYYY-MM-DD'), // ใช้วันที่ปัจจุบันในการตรวจสอบ
                    stock_id: null // ถ้าต้องการตรวจสอบสำหรับทุก stock_id
                });

                // ตรวจสอบว่าได้ข้อมูล existingDividends หรือไม่
                if (!existingDividends) {
                    throw new Error('ไม่สามารถดึงข้อมูลปันผลที่มีอยู่จากฐานข้อมูลได้');
                }

                // แปลงข้อมูล existingDividends ให้เป็นรูปแบบที่ตรวจสอบได้ง่าย
                const existingDividendSet = new Set(existingDividends.map(item =>
                    `${item.stock_id}-${moment(item.created_date).tz('Asia/Bangkok').format('YYYY-MM-DD')}`
                ));

                Papa.parse(data, {
                    header: true,
                    complete: (results) => {
                        // กรองข้อมูลให้เอาเฉพาะแถวที่ dividend เป็น float และไม่ซ้ำกับ existing dividends
                        this.csvData = results.data
                            .filter(item => {
                                const dividend = parseFloat(item.dividend);
                                const createdDate = moment(item.xdate).tz('Asia/Bangkok').format('YYYY-MM-DD'); // แปลง created_date
                                const stockId = this.getStockByName(item.symbol)?.no; // รับ stock_id จาก symbol

                                // ตรวจสอบว่าเป็น float ที่ไม่ใช่ NaN และไม่ซ้ำกับ existing dividends
                                return !isNaN(dividend) && !existingDividendSet.has(`${stockId}-${createdDate}`);
                            })
                            .map(item => ({
                                xdate: item.xdate,
                                symbol: item.symbol,
                                dividend: parseFloat(item.dividend), // แปลงเป็น float เพื่อความถูกต้อง
                                remark: item.remark
                            }));

                        this.isLoadingDividendYield = false;
                        this.isDataLoaded = true;
                    },
                });
            } catch (error) {
                console.error('เกิดข้อผิดพลาดในการประมวลผลข้อมูล:', error); // Log ข้อผิดพลาด
                alert('ไม่สามารถประมวลผลข้อมูลได้: ' + error.message); // แจ้งเตือนผู้ใช้
            }
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

                    // แปลง symbol เป็น int
                    const stockId = this.getStockByName(symbol).no;

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
                        const created_date = stockData.xdate; // วันที่ที่ได้จาก stockData

                        // แปลง created_date เป็นเวลาของเขต Bangkok/Asia
                        const newCreatedDate = moment.tz(created_date, 'Asia/Bangkok').toDate();

                        // ตรวจสอบข้อมูล dividend
                        const existingDividend = await this.$store.dispatch('api/dividend/getDividends', {
                            x_date: moment(created_date).tz('Asia/Bangkok').format('YYYY-MM-DD'), // ใช้ฟอร์แมตวันที่
                            stock_id: stockId
                        });

                        console.log('Existing dividends:', existingDividend); // Log existing dividends

                        // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
                        const isDuplicate = existingDividend.some(item => {
                            const existingCreatedDate = moment.tz(item.created_date, 'Asia/Bangkok').toDate();
                            return item.stock_id === stockId && existingCreatedDate.toDateString() === newCreatedDate.toDateString();
                        });

                        if (isDuplicate) {
                            console.log(`ข้อมูลปันผลสำหรับ ${symbol} วันที่ ${moment(created_date).tz('Asia/Bangkok').format('YYYY-MM-DD')} มีอยู่แล้วในฐานข้อมูล`);
                            continue; // ข้ามการเพิ่มข้อมูล
                        }

                        // ถ้าไม่มีข้อมูลซ้ำให้เพิ่มข้อมูลใหม่
                        console.log('Adding new dividend with data:', {
                            updated_date: moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
                            created_date: moment(created_date).tz('Asia/Bangkok').format('YYYY-MM-DD'),
                            emp_id: this.$auth.user.no,
                            stock_id: stockId,
                            dividend: dividend,
                        });

                        await this.$store.dispatch('api/dividend/addDividend', {
                            updated_date: moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
                            created_date: moment(created_date).tz('Asia/Bangkok').format('YYYY-MM-DD'),
                            emp_id: this.$auth.user.no,
                            stock_id: stockId,
                            dividend: dividend,
                        });
                    }
                }

                this.modal.complete.open = true;
                this.modal.complete.message = 'บันทึกข้อมูลเรียบร้อยแล้ว';
            } catch (error) {
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
            }
        },

        recordLog() {
            const log = { 
                emp_name: this.$auth.user.fname + ' ' + this.$auth.user.lname,
                emp_email: this.$auth.user.email,
                detail: 'ชื่อไฟล์.csv',
                type: 2,
                picture: this.$auth.user.picture || 'Unknown',
                action: this.currentAction === 'delete'
                    ? 'ลบประเภทหุ้น'
                    : 'ลบประเภทหุ้น',
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };
            this.$store.dispatch('api/log/addLogs', log);
        },

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
