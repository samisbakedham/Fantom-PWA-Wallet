<template>
    <div class="claim-rewards-confirmation">
        <tx-confirmation
            :tx="tx"
            confirmation-comp-name="claim-rewards-confirmation"
            send-button-label="Claim Rewards"
            password-label="Please enter your wallet password to claim rewards"
            :hide-tx-form="cantRestake"
            :on-send-transaction-success="onSendTransactionSuccess"
            card-off
            :show-cancel-button="true"
            :window-mode="true"
            class="min-h-100"
            @cancel-button-click="$emit('cancel-button-click', $event)"
        >
            <h2 class="not-visible" data-focus>
                <span v-if="reStake">Claim & Restake</span>
                <span v-else>Claim Rewards</span>
            </h2>

            <div class="transaction-info">
                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Validator</div>
                    <div class="col break-word">
                        <f-placeholder :content-loaded="!!dAccountInfo.stakerId" :replacement-num-chars="14">
                            <template v-if="dAccountInfo.stakerId">
                                {{ dAccountInfo.stakerInfo.stakerInfo.name }}, {{ dAccountInfo.stakerId }}
                            </template>
                        </f-placeholder>
                    </div>
                </div>

                <div class="row no-collapse">
                    <div class="col-3 f-row-label">Amount</div>
                    <div class="col break-word">
                        <f-placeholder :content-loaded="!!dAccountInfo.stakerId" :replacement-num-chars="14">
                            <template v-if="dAccountInfo.stakerId">
                                <f-t-m-token-value :value="dAccountInfo.delegation.pendingRewards.amount" convert />
                            </template>
                        </f-placeholder>
                    </div>
                </div>
            </div>

            <f-message
                v-if="dAccountInfo.stakerId"
                v-show="cantRestake"
                type="error"
                alert
                with-icon
                style="margin-bottom: 16px;"
            >
                Staking limit reached. You can restake max {{ delegatedLimit }} CNDL on validator
                {{ dAccountInfo.stakerInfo.stakerInfo.name }}, {{ dAccountInfo.stakerId }}
            </f-message>

            <template #window-content>
                <ledger-confirmation-content :to="tx.to" :amount="0" :max-fee="tx._fee" />
            </template>
        </tx-confirmation>
    </div>
</template>

<script>
import { toFTM, WEIToFTM } from '@/utils/transactions.js';
import { mapGetters } from 'vuex';
import sfcUtils from 'fantom-ledgerjs/src/sfc-utils.js';
import TxConfirmation from '../TxConfirmation/TxConfirmation.vue';
import { SFC_CLAIM_MAX_EPOCHS } from '@/plugins/fantom-web3-wallet.js';
import LedgerConfirmationContent from '../LedgerConfirmationContent/LedgerConfirmationContent.vue';
import FPlaceholder from '@/components/core/FPlaceholder/FPlaceholder.vue';
import gql from 'graphql-tag';
import FMessage from '@/components/core/FMessage/FMessage.vue';
import FTMTokenValue from '@/components/core/FTMTokenValue/FTMTokenValue.vue';

export default {
    name: 'ClaimRewardsConfirmation',

    components: { FTMTokenValue, FMessage, FPlaceholder, LedgerConfirmationContent, TxConfirmation },

    props: {
        /** `accountInfo` object from `StakingInfo` component. */
        accountInfo: {
            type: Object,
            default() {
                return {};
            },
        },
        /***/
        stakerId: {
            type: String,
            default: '',
        },
        /***/
        reStake: {
            type: Boolean,
            default: false,
        },
        /***/
        fromDelegationList: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            tx: {},
            dAccountInfo: this.accountInfo,
            cantRestake: false,
            delegatedLimit: 0,
        };
    },

    computed: {
        ...mapGetters(['currentAccount']),
    },

    // activated() {
    async mounted() {
        if (!this.accountInfo.stakerId) {
            await this.loadDelegationInfo();
        }

        if (!this.reStake || !this.delegatedLimitReached()) {
            await this.setTx();
        }
    },

    methods: {
        delegatedLimitReached() {
            const delegatedLimit = this.dAccountInfo.stakerInfo.delegatedLimit;
            const amount = this.dAccountInfo.delegation.pendingRewards.amount;

            this.delegatedLimit = parseFloat(this.$fWallet.WEIToFTM(delegatedLimit)).toFixed(2);
            this.cantRestake = this.$defi.compareBN(delegatedLimit, amount) === -1;

            return this.cantRestake;
        },

        async setTx() {
            this.tx = await this.$fWallet.getSFCTransactionToSign(
                this.reStake
                    ? sfcUtils.claimDelegationRewardsCompoundTx(SFC_CLAIM_MAX_EPOCHS, parseInt(this.stakerId, 16))
                    : sfcUtils.claimDelegationRewardsTx(SFC_CLAIM_MAX_EPOCHS, parseInt(this.stakerId, 16)),
                this.currentAccount.address
            );
        },

        async loadDelegationInfo() {
            const data = await Promise.all([this.fetchDelegation(), this.fetchStakerInfo()]);

            this.dAccountInfo = {
                stakerId: parseInt(this.stakerId, 16),
                delegation: data[0],
                stakerInfo: data[1],
            };
        },

        /**
         * Fetch delegation by staker id and current account address.
         */
        async fetchDelegation() {
            const data = await this.$apollo.query({
                query: gql`
                    query Delegation($address: Address!, $staker: BigInt!) {
                        delegation(address: $address, staker: $staker) {
                            pendingRewards {
                                amount
                            }
                        }
                    }
                `,
                variables: {
                    address: this.currentAccount.address,
                    staker: this.stakerId,
                },
                fetchPolicy: 'network-only',
            });

            return data.data.delegation;
        },

        async fetchStakerInfo() {
            const stakerInfo = this.stakerId ? await this.$fWallet.getStakerById(this.stakerId) : null;

            if (stakerInfo && !stakerInfo.stakerInfo) {
                stakerInfo.stakerInfo = {
                    name: 'Unknown',
                };
            }

            return stakerInfo;
        },

        onSendTransactionSuccess(_data) {
            this.$emit('change-component', {
                to: 'staking-claim-rewards-confirmation-success-message',
                from: 'claim-rewards-confirmation',
                data: {
                    tx: _data.data.sendTransaction.hash,
                    successMessage: this.reStake ? 'Claim & Restake Rewards Successful' : 'Claiming Rewards Successful',
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

        toFTM,
        WEIToFTM,
    },
};
</script>
