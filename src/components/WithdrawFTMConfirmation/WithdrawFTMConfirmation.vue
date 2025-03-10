<template>
    <div class="withdraw-ftm-confirmation">
        <tx-confirmation
            :tx="tx"
            confirmation-comp-name="withdraw-ftm-confirmation"
            send-button-label="Withdraw"
            password-label="Please enter your wallet password to withdraw your CNDL"
            :on-send-transaction-success="onSendTransactionSuccess"
            card-off
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <h2 class="not-visible" data-focus>Withdraw delegated CNDL - Confirmation</h2>

            <div class="transaction-info">
                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Validator</div>
                    <div class="col break-word">
                        {{ accountInfo.stakerInfo.stakerInfo.name }}, {{ parseInt(accountInfo.stakerInfo.id) }}
                    </div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">From</div>
                    <div class="col break-word">
                        {{ currentAccount.address }}
                        <span class="f-row-label">
                            ( <f-t-m-token-value :value="currentAccount.balance" convert /> )
                        </span>
                    </div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Amount</div>
                    <div class="col break-word">{{ amount }}</div>
                </div>

                <!--                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Transaction Value</div>
                    <div class="col break-word">0</div>
                </div>-->
            </div>

            <template #window-content>
                <ledger-confirmation-content :to="tx.to" :amount="0" :max-fee="tx._fee">
                    <li>
                        <div class="row no-collapse">
                            <div class="col-3 f-row-label">Transaction Value</div>
                            <div class="col">
                                0
                            </div>
                        </div>
                    </li>
                </ledger-confirmation-content>
            </template>
        </tx-confirmation>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import sfcUtils from 'fantom-ledgerjs/src/sfc-utils.js';
import TxConfirmation from '../TxConfirmation/TxConfirmation.vue';
import LedgerConfirmationContent from '../LedgerConfirmationContent/LedgerConfirmationContent.vue';
import FTMTokenValue from '@/components/core/FTMTokenValue/FTMTokenValue.vue';

export default {
    name: 'WithdrawFTMConfirmation',

    components: { FTMTokenValue, LedgerConfirmationContent, TxConfirmation },

    props: {
        /** `accountInfo` object from `UnstakeFTM` component. */
        accountInfo: {
            type: Object,
            default() {
                return {};
            },
        },
        /** Amount of FTM tokens to withdraw */
        amount: {
            type: Number,
            default: 1,
        },
        /** `withdrawRequest` object from `WithdrawRequestList` component. */
        withdrawRequest: {
            type: Object,
            default() {
                return {};
            },
        },
        stakerId: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            tx: {},
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),
    },

    // activated() {
    mounted() {
        this.setTx();
    },

    methods: {
        async setTx() {
            const { withdrawRequest } = this;

            if (withdrawRequest.withdrawRequestID) {
                this.tx = await this.$fWallet.getSFCTransactionToSign(
                    sfcUtils.withdrawPartTx(parseInt(withdrawRequest.stakerID, 16), withdrawRequest.withdrawRequestID),
                    this.currentAccount.address
                );
            } else {
                throw 'Need withdrawRequestID :(';
            }
        },

        onSendTransactionSuccess(_data) {
            this.$emit('change-component', {
                to: 'staking-withdraw-ftm-confirmation-success-message',
                from: 'withdraw-ftm-confirmation',
                data: {
                    tx: _data.data.sendTransaction.hash,
                    successMessage: 'Undelegation Successful',
                    continueToParams: {
                        stakerId: this.stakerId,
                    },
                    continueTo: 'hide-window',
                    continueButtonLabel: 'Close',
                    cardOff: true,
                    windowMode: true,
                },
            });
        },
    },
};
</script>
