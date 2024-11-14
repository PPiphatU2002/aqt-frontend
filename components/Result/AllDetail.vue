<template>
    <v-dialog v-model="open" max-width="1000px">
        <v-card>
            <v-card-title>ข้อมูลหุ้นของพอร์ตนี้</v-card-title>
            <v-card-text>
                <div v-if="currentItem">
                    <v-simple-table>
                        <thead>
                            <tr>
                                <th>วันที่ซื้อหุ้น</th>
                                <th>ชื่อหุ้น</th>
                                <th>ราคา</th>
                                <th>จำนวน</th>
                                <th>จำนวนเงิน</th>
                                <th>จำนวนปันผล</th>
                                <th>ยอดเงินปันผล</th>
                                <th>จำนวนเงินรวมปันผล</th>
                                <th>ที่มาที่ไป</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{{ formatDate(getDetailsByNo(currentItem.no)?.created_date || 'ยังไม่ระบุวันที่')
                                    }}</td>
                                <td>{{ getStockByNo(currentItem.stock_id)?.name }}</td>
                                <td>{{ ((getDetailsByNo(currentItem.no)?.price *
                                    getDetailsByNo(currentItem.no)?.amount) /
                                    getDetailsByNo(currentItem.no)?.amount).toLocaleString(2) }}</td>
                                <td>{{ getDetailsByNo(currentItem.no)?.amount.toLocaleString(2) }}</td>
                                <td>{{ (getDetailsByNo(currentItem.no)?.price *
                                    getDetailsByNo(currentItem.no)?.amount).toLocaleString(2) }}</td>
                                <td>{{ getDividendByDateAndStock(currentItem.stock_id,
                                    getDetailsByNo(currentItem.no)?.created_date) }}</td>
                                <td>{{ (getDetailsByNo(currentItem.no)?.amount *
                                    getDividendByDateAndStock(currentItem.stock_id,
                                        getDetailsByNo(currentItem.no)?.created_date)).toLocaleString(2) }}</td>
                                <td>{{ ((getDetailsByNo(currentItem.no)?.price *
                                    getDetailsByNo(currentItem.no)?.amount) -
                                    (getDetailsByNo(currentItem.no)?.amount *
                                        getDividendByDateAndStock(currentItem.stock_id,
                                            getDetailsByNo(currentItem.no)?.created_date))).toLocaleString(2) }}</td>
                                <td :style="{ color: getFromText(getFromByNo(currentItem.from_id)?.from).color }">
                                    {{ getFromText(getFromByNo(currentItem.from_id)?.from).text }}
                                </td>
                            </tr>


                            <tr v-for="transaction in getTransactionsByStockDetailId(currentItem.no)"
                                :key="transaction.id">
                                <td>{{ formatDate(transaction.created_date || 'ยังไม่ระบุวันที่') }}</td>
                                <td>{{ getStockByNo(currentItem.stock_id)?.name }}</td>
                                <td>{{ (((transaction.price * transaction.amount) + (transaction.price *
                                    transaction.amount * getCommissionByNo(transaction.commission_id)?.commission) +
                                    (transaction.price * transaction.amount *
                                        getCommissionByNo(transaction.commission_id)?.commission * 0.07)) /
                                    transaction.amount).toLocaleString(2) }}</td>
                                <td>{{ transaction.amount.toLocaleString(2) }}</td>
                                <td>{{ ((transaction.price * transaction.amount) + (transaction.price *
                                    transaction.amount * getCommissionByNo(transaction.commission_id)?.commission) +
                                    (transaction.price * transaction.amount *
                                        getCommissionByNo(transaction.commission_id)?.commission * 0.07)).toLocaleString(2)
                                    }}</td>
                                <td>{{ getDividendByDateAndStock(currentItem.stock_id, transaction.created_date) }}</td>
                                <td>{{ (transaction.amount * getDividendByDateAndStock(currentItem.stock_id,
                                    transaction.created_date)).toLocaleString(2) }}</td>
                                <td>{{ (((transaction.price * transaction.amount) + (transaction.price *
                                    transaction.amount * getCommissionByNo(transaction.commission_id)?.commission) +
                                    (transaction.price * transaction.amount *
                                        getCommissionByNo(transaction.commission_id)?.commission * 0.07)) -
                                    (transaction.amount
                                        * getDividendByDateAndStock(currentItem.stock_id,
                                            transaction.created_date))).toLocaleString(2)
                                    }}</td>
                                <td :style="{ color: getFromText(getFromByNo(transaction.from_id)?.from).color }">
                                    {{ getFromText(getFromByNo(transaction.from_id)?.from).text }}
                                </td>
                            </tr>

                            <tr>
                                <td></td>
                                <td :style="{ color: '#e30311' }">เฉลี่ยรวม</td>
                                <td>{{ (totalNetSum / totalAmountSum).toLocaleString(2) }}</td>
                                <td>{{ totalAmountSum.toLocaleString(2) }}</td>
                                <td>{{ totalPriceSum.toLocaleString(2) }}</td>
                                <td>{{ totalDividendSum.toLocaleString(2) }}</td>
                                <td>{{ totalDividendAmountSum.toLocaleString(2) }}</td>
                                <td>{{ totalNetSum.toLocaleString(2) }}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </div>
                <div v-else>
                    <p>ไม่มีข้อมูล</p>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="toggleItemOpenStatus">ปิด</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import moment from 'moment-timezone';
import 'moment/locale/th'
import Decimal from 'decimal.js';

export default {
    props: {
        open: Boolean,
        data: Object,
        currentItem: Object,
    },

    data() {
        return {
            stocks: [],
            dividends: [],
            froms: [],
            transactions: [],
            commissions: [],
            details: []
        }
    },

    computed: {
        totalAmountSum() {
            return this.transactions.reduce((sum, transaction) => {
                if (transaction.stock_detail_id === this.currentItem.no) {
                    return sum.plus(new Decimal(transaction.amount));
                }
                return sum;
            }, new Decimal(this.getDetailsByNo(this.currentItem.no)?.amount || 0)).toNumber();
        },
        totalPriceSum() {
            return this.transactions.reduce((sum, transaction) => {
                if (transaction.stock_detail_id !== this.currentItem.no) {
                    return sum;
                }

                const transactionTotal = new Decimal(transaction.price).times(transaction.amount);
                const commission = new Decimal(this.getCommissionByNo(transaction.commission_id)?.commission || 0);
                const dividendAmount = new Decimal(transaction.amount).times(this.getDividendByDateAndStock(this.currentItem.stock_id, transaction.created_date) || 0);
                const net = transactionTotal
                    .plus(transactionTotal.times(commission))
                    .plus(transactionTotal.times(commission).times(0.07))
                    .minus(dividendAmount);
                return sum.plus(net);
            }, new Decimal(this.getDetailsByNo(this.currentItem.no)?.price || 0).times(this.getDetailsByNo(this.currentItem.no)?.amount || 0)).toNumber();
        },
        totalDividendSum() {
            return this.transactions.reduce((sum, transaction) => {
                if (transaction.stock_detail_id === this.currentItem.no) {
                    return sum.plus(new Decimal(this.getDividendByDateAndStock(this.currentItem.stock_id, transaction.created_date) || 0));
                }
                return sum;
            }, new Decimal(this.getDividendByDateAndStock(this.currentItem.stock_id, this.currentItem.created_date) || 0)).toNumber();
        },
        dividendCount() {
            return this.transactions.length + (this.currentItem ? 1 : 0);
        },
        totalDividendAmountSum() {
            return this.transactions.reduce((sum, transaction) => {
                if (transaction.stock_detail_id === this.currentItem.no) {
                    return sum.plus(new Decimal(transaction.amount).times(this.getDividendByDateAndStock(this.currentItem.stock_id, transaction.created_date) || 0));
                }
                return sum;
            }, new Decimal(this.getDetailsByNo(this.currentItem.no)?.amount || 0).times(this.getDividendByDateAndStock(this.currentItem.stock_id, this.currentItem.created_date) || 0)).toNumber();
        },
        totalNetSum() {
            return this.transactions.reduce((sum, transaction) => {
                if (transaction.stock_detail_id !== this.currentItem.no) {
                    return sum;
                }

                const transactionTotal = new Decimal(transaction.price).times(transaction.amount);
                const commission = new Decimal(this.getCommissionByNo(transaction.commission_id)?.commission || 0);
                const dividendAmount = new Decimal(transaction.amount).times(this.getDividendByDateAndStock(this.currentItem.stock_id, transaction.created_date) || 0);
                const net = transactionTotal
                    .plus(transactionTotal.times(commission))
                    .plus(transactionTotal.times(commission).times(0.07))
                    .minus(dividendAmount);
                return sum.plus(net);
            }, new Decimal(this.getDetailsByNo(this.currentItem.no)?.price || 0)
                .times(this.getDetailsByNo(this.currentItem.no)?.amount || 0)
                .minus(new Decimal(this.getDetailsByNo(this.currentItem.no)?.amount || 0).times(this.getDividendByDateAndStock(this.currentItem.stock_id, this.currentItem.created_date) || 0))
            ).toNumber();
        }
    },

    async mounted() {
        await this.fetchStockData();
        await this.fetchDividendData();
        await this.fetchFromData();
        await this.fetchCommissionData();
        await this.fetchTransactionAndDetailData();
    },

    methods: {
        toggleItemOpenStatus() {
            if (this.currentItem) {
                this.currentItem.isOpen = !this.currentItem.isOpen;
            }
            this.$emit('update:open', false);
        },

        async fetchCommissionData() {
            this.commissions = await this.$store.dispatch('api/commission/getCommissions');
        },

        getCommissionByNo(commissionNo) {
            return this.commissions.find(commission => commission.no === commissionNo);
        },

        async fetchTransactionAndDetailData() {
            const allTransactions = await this.$store.dispatch('api/transaction/getTransactions');
            const allDetails = await this.$store.dispatch('api/detail/getDetails');
            this.details = allDetails;
            this.transactions = allTransactions.filter(transaction => transaction.type === 1);
            const type2Transactions = allTransactions.filter(transaction => transaction.type === 2);
            const type1Transactions = allTransactions.filter(transaction => transaction.type === 1);

            for (let type2Transaction of type2Transactions) {
                let remainingAmount = new Decimal(type2Transaction.amount);

                const matchingType1Transactions = type1Transactions
                    .filter(transaction => transaction.stock_detail_id === type2Transaction.stock_detail_id)
                    .sort((a, b) => moment(b.created_date).diff(moment(a.created_date)));

                for (let type1Transaction of matchingType1Transactions) {
                    if (moment(type2Transaction.created_date).isBefore(moment(type1Transaction.created_date))) {
                        continue;
                    }
                    if (remainingAmount.isZero()) break;
                    const amountToDeduct = new Decimal(type1Transaction.amount);

                    if (amountToDeduct.gte(remainingAmount)) {
                        type1Transaction.amount = amountToDeduct.minus(remainingAmount).toNumber();
                        remainingAmount = new Decimal(0);
                        break;
                    } else {
                        type1Transaction.amount = 0;
                        remainingAmount = remainingAmount.minus(amountToDeduct);
                    }
                }

                if (!remainingAmount.isZero()) {
                    const detail = this.details.find(detail => detail.no === type2Transaction.stock_detail_id);
                    if (detail) {
                        this.$set(detail, 'amount', new Decimal(detail.amount).minus(remainingAmount).toNumber())
                    }
                }
            }

            this.transactions = this.transactions.filter(transaction => transaction.amount > 0);
        },

        getDetailsByNo(detailNo) {
            return this.details.find(detail => detail.no === detailNo);
        },

        async fetchStockData() {
            this.stocks = await this.$store.dispatch('api/stock/getStocks');
        },

        getStockByNo(stockNo) {
            return this.stocks.find(stock => stock.no === stockNo);
        },

        async fetchFromData() {
            this.froms = await this.$store.dispatch('api/from/getFroms');
        },

        getFromByNo(fromNo) {
            return this.froms.find(from => from.no === fromNo);
        },

        async fetchDividendData() {
            this.dividends = await this.$store.dispatch('api/dividend/getDividends');
        },

        getDividendByDateAndStock(stock_id, created_date) {
            if (!created_date || this.dividends.length === 0) {
                return 0;
            }
            const filteredDividendData = this.dividends.filter(dividend => {
                const dividendDate = moment(dividend.created_date);
                return (
                    dividend.stock_id === stock_id &&
                    dividendDate.isSameOrAfter(moment(created_date))
                );
            });
            const totalDividend = filteredDividendData.reduce(
                (sum, dividend) => sum.plus(new Decimal(dividend.dividend || 0)),
                new Decimal(0)
            );
            return totalDividend.toNumber();
        },

        getTransactionsByStockDetailId(stockDetailId) {
            return this.transactions.filter(transaction =>
                transaction.stock_detail_id === stockDetailId && transaction.type === 1
            );
        },

        formatDate(date) {
            if (!date || !moment(date, moment.ISO_8601, true).isValid()) {
                return 'ยังไม่ระบุวันที่';
            }
            return moment(date).format('YYYY-MM-DD');
        },

        getFromText(from) {
            if (from === 'หุ้นเก่า') {
                return { text: 'หุ้นเก่า', color: '#ffc800' };
            } else if (from === 'หุ้นใหม่') {
                return { text: 'หุ้นใหม่', color: '#00bf63' };
            } else if (from === 'หุ้นแก้เกม') {
                return { text: 'หุ้นแก้เกม', color: '#38b6ff' };
            } else {
                return { text: '', color: 'inherit' };
            }
        },
    }
};
</script>
