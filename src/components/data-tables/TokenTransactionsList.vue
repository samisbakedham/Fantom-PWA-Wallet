<template>
    <div>
        <div v-for="(tx, index) in tokenTransactions" :key="index" class="token-transaction-item">
            <!-- Transfer 5 wFTM (ERC-20) From 0x.... To 0x... -->
            <span class="txType">{{ toCamelCase(tx.type) }}</span>
            <f-token-value
                :token="{ symbol: tx.tokenSymbol || 'tokens', decimals: tx.tokenDecimals }"
                :value="tx.amount"
                convert-value
                :use-placeholder="false"
            />
            <small>({{ tx.tokenType }})</small>
            <template v-if="isOtherAddress(tx.sender)">
                <span>From</span>
                <a :href="`${explorerUrl}address/${tx.sender}`" rel="noopener" target="_blank">
                    <f-ellipsis :text="tx.sender || ''" overflow="middle" />
                </a>
            </template>
            <template v-if="isOtherAddress(tx.recipient)">
                <span>To</span>
                <a :href="`${explorerUrl}address/${tx.recipient}`" rel="noopener" target="_blank">
                    <f-ellipsis :text="tx.recipient || ''" overflow="middle" />
                </a>
            </template>
        </div>
    </div>
</template>

<script>
import appConfig from '../../../app.config.js';
import FEllipsis from '../core/FEllipsis/FEllipsis';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';

export default {
    name: 'TokenTransactionsList',

    components: {
        FTokenValue,
        FEllipsis,
    },

    props: {
        // token transactions list
        tokenTransactions: {
            type: Array,
            required: true,
        },

        // account address
        address: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            explorerUrl: appConfig.explorerUrl,
        };
    },

    methods: {
        isOtherAddress(address) {
            return (
                address.toLowerCase() !== this.address.toLowerCase() &&
                address.toLowerCase() !== '0x0000000000000000000000000000000000000000'
            );
        },

        toCamelCase(str) {
            return str.charAt(0) + str.slice(1).toLowerCase();
        },
    },
};
</script>

<style lang="scss">
.token-transaction-item {
    display: flex;
    margin-left: 8em;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 6px;

    a {
        max-width: 200px;
    }

    small {
        font-size: 0.8em;
    }

    .f-token-value {
        font-weight: bold;
    }

    .txType {
        color: var(--f-success-color);
    }
}
</style>
