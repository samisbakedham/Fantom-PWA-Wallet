import Vue from 'vue';

import DefiDepositConfirmation from '@/components/DefiDepositConfirmation/DefiDepositConfirmation.vue';
import DefiBorrowConfirmation from '@/components/DefiBorrowConfirmation/DefiBorrowConfirmation.vue';
import DefiFMintPushRewardsConfirmation from '@/views/DefiFMintPushRewardsConfirmation/DefiFMintPushRewardsConfirmation.vue';
import DefiFMintClaimRewardsConfirmation from '@/views/DefiFMintClaimRewardsConfirmation/DefiFMintClaimRewardsConfirmation.vue';
import DefiFTradeConfirmation from '@/views/DefiFTradeConfirmation/DefiFTradeConfirmation.vue';

Vue.component('DefiDepositConfirmation', DefiDepositConfirmation);
Vue.component('DefiBorrowConfirmation', DefiBorrowConfirmation);
Vue.component('DefiFMintPushRewardsConfirmation', DefiFMintPushRewardsConfirmation);
Vue.component('DefiFMintClaimRewardsConfirmation', DefiFMintClaimRewardsConfirmation);
Vue.component('DefiFTradeConfirmation', DefiFTradeConfirmation);
