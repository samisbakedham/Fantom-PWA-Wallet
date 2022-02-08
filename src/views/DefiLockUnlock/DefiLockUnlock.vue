<template>
    <div class="view-defi-lock-unlock">
        <h1 class="with-back-btn" data-focus>
            Lock/Unlock wFTM
            <f-back-button :route-name="backButtonRoute" />
        </h1>

        <h2 class="perex">
            Lock wFTM to increase the collateral ratio and mint fUSD, unlock wFTM after you repaid fUSD.
        </h2>

        <defi-deposit
            :token="params.token"
            single-token
            lock-unlock-mode
            token-symbol="WFTM"
            on-submit-route="defi-lock-unlock-confirmation"
        />
    </div>
</template>

<script>
import FBackButton from '@/components/core/FBackButton/FBackButton.vue';
import DefiDeposit from '@/components/DefiDeposit/DefiDeposit.vue';
import { getAppParentNode } from '@/app-structure.js';
import { focusElem } from '@/utils/aria.js';

export default {
    name: 'DefiLockUnlock',

    components: { DefiDeposit, FBackButton },

    computed: {
        /**
         * @return {{token: DefiToken}|{}}
         */
        params() {
            const { $route } = this;

            return $route && $route.params ? $route.params : {};
        },

        backButtonRoute() {
            const parentNode = getAppParentNode('defi-lock-unlock');

            return parentNode ? parentNode.id : '';
        },
    },

    mounted() {
        focusElem(this.$el);
    },
};
</script>
