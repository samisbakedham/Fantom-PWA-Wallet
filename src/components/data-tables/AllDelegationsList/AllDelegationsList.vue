<template>
    <div class="all-delegation-list-dt">
        <!--
        <h2 class="dt-heading">
            Delegations <span class="f-records-count">({{ totalCount | formatHexToInt }})</span>
        </h2>
        -->

        <template v-if="!delegationsByAddressError">
            <f-data-table
                :columns="columns"
                :items="dItems"
                :mobile-view="mobileView"
                :loading="loading"
                :force-loading="true"
                first-m-v-column-width="5"
                f-card-off
                action-on-row
                caption="All Delegations"
                class="f-data-table-body-bg-color"
                @row-action="$emit('row-action', $event)"
            >
                <template v-slot:column-accountName="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-5 f-row-label">{{ column.label }}</div>
                        <div class="col-7">
                            <template v-if="value">{{ value }}</template>
                            <template v-else><f-ellipsis :text="item.accountAddress" overflow="middle" /></template>
                        </div>
                    </div>
                    <template v-else>
                        <template v-if="value">{{ value }}</template>
                        <template v-else><f-ellipsis :text="item.accountAddress" overflow="middle" /></template>
                    </template>
                </template>
                <template v-slot:column-validator="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-5 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <template v-if="value">
                                {{ value.stakerInfo && value.stakerInfo.name ? value.stakerInfo.name : 'Unknown' }},
                                {{ value.id | formatHexToInt }}
                            </template>
                        </div>
                    </div>
                    <template v-else-if="value">
                        {{ value.stakerInfo && value.stakerInfo.name ? value.stakerInfo.name : 'Unknown' }},
                        {{ value.id | formatHexToInt }}
                    </template>
                </template>

                <template v-slot:column-amount="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-6 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <f-token-value
                                :value="value"
                                :decimals="filtersOptions.fractionDigits"
                                :use-placeholder="false"
                                no-currency
                            />
                        </div>
                    </div>
                    <template v-else>
                        <f-token-value
                            :value="value"
                            :decimals="filtersOptions.fractionDigits"
                            :use-placeholder="false"
                            no-currency
                        />
                    </template>
                </template>

                <template v-slot:column-detail="{ value, item, column }">
                    <div v-if="column" class="row no-collapse no-vert-col-padding">
                        <div class="col-5 f-row-label">{{ column.label }}</div>
                        <div class="col break-word">
                            <!--                            <button class="btn">Detail</button>-->
                            <a href="#" @click="onDetailLinkClick">Detail</a>
                            <br />
                            <a href="#" @click="(_event) => onClaimRewardsLinkClick(_event, item)">
                                Claim Rewards
                            </a>
                            <br />
                            <a href="#" @click="(_event) => onClaimRewardsLinkClick(_event, item, true)">
                                Claim & Restake
                            </a>
                        </div>
                    </div>
                    <template v-else-if="value">
                        <!--                        <button class="btn">Detail</button>-->
                        <a href="#" @click="onDetailLinkClick">Detail</a>
                        <br />
                        <a href="#" @click="(_event) => onClaimRewardsLinkClick(_event, item)">
                            Claim Rewards
                        </a>
                        <br />
                        <a href="#" @click="(_event) => onClaimRewardsLinkClick(_event, item, true)">
                            Claim & Restake
                        </a>
                    </template>
                </template>
            </f-data-table>
        </template>
        <template v-else>
            <div class="query-error">{{ delegationsByAddressError }}</div>
        </template>
    </div>
</template>

<script>
import FDataTable from '@/components/core/FDataTable/FDataTable.vue';
import gql from 'graphql-tag';
// import { cloneObject } from '@/utils';
import { filtersOptions, formatDate, timestampToDate } from '@/filters.js';
import { WEIToFTM } from '@/utils/transactions.js';
import appConfig from '../../../../app.config.js';
import { mapGetters } from 'vuex';
import FEllipsis from '@/components/core/FEllipsis/FEllipsis.vue';
import FTokenValue from '@/components/core/FTokenValue/FTokenValue.vue';
// import { formatHexToInt } from '@/filters.js';
export default {
    name: 'AllDelegationsList',

    components: { FTokenValue, FEllipsis, FDataTable },

    props: {
        /** */
        accountAddress: {
            type: String,
            default: '',
            required: true,
        },
        /** */
        loadData: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            columns: [
                {
                    name: 'accountName',
                    label: 'Wallet',
                    itemProp: 'accountName',
                    width: '150px',
                },
                {
                    name: 'createdTime',
                    label: 'Delegation Time',
                    itemProp: 'delegation.createdTime',
                    formatter: (_value) => formatDate(timestampToDate(_value), true, false, { month: 'short' }),
                },
                {
                    name: 'validator',
                    label: 'Validator',
                    itemProp: 'delegation._validator',
                    // formatter: (_value, _item) => _item._validator,
                    width: '150px',
                    cssClass: 'align-center',
                },
                {
                    name: 'amount',
                    label: 'Amount (FTM)',
                    itemProp: 'delegation.amount',
                    formatter: (_value) => WEIToFTM(_value),
                    width: '160px',
                    cssClass: 'align-center',
                },
                /*{
                    name: 'rewards',
                    label: 'Pending Rewards (FTM)',
                    itemProp: 'delegation.pendingRewards',
                    formatter: (_value) => (_value ? formatNumberByLocale(WEIToFTM(_value.amount)) : '-'),
                    width: '160px',
                    cssClass: 'align-center',
                },
                {
                    name: '',
                    label: 'Unlock Date',
                    itemProp: 'delegation.lockedUntil',
                    formatter: (_value) => formatDate(timestampToDate(_value), true, false, { month: 'short' }) || '-',
                    cssClass: 'align-center',
                },*/
                {
                    name: 'detail',
                    label: 'Action',
                    itemProp: 'delegation.lockedUntil',
                    cssClass: 'align-end',
                },
            ],
            dItems: [],
            explorerUrl: appConfig.explorerUrl,
            loading: true,
            stopLoading: false,
            delegationsByAddressError: '',
            totalCount: 0,
            filtersOptions,
        };
    },

    computed: {
        ...mapGetters(['accounts']),

        /**
         * Property is set to `true`, if 'account-transaction-list-dt-mobile-view' breakpoint is reached.
         *
         * @return {Boolean}
         */
        mobileView() {
            const dataTableBreakpoint = this.$store.state.breakpoints['account-transaction-list-dt-mobile-view'];

            return dataTableBreakpoint && dataTableBreakpoint.matches;
        },
    },

    watch: {
        loadData(_value) {
            if (_value) {
                this.init();
            }
        },
    },

    created() {
        if (this.loadData) {
            this.init();
        }
    },

    beforeDestroy() {
        this.stopLoading = true;
    },

    methods: {
        async init() {
            const { accounts } = this;

            this.loading = true;

            if (accounts) {
                for (let i = 0; i < accounts.length; i++) {
                    await this.addDelegations(accounts[i]);

                    if (this.stopLoading) {
                        break;
                    }
                }
            }

            this.loading = false;
        },

        /**
         * @param {WalletAccount} _account
         * @return {Promise<>}
         */
        async addDelegations(_account) {
            const delegations = await this.fetchDelegationsByAddress(_account.address);

            delegations.forEach((_item) => {
                _item.accountName = _account.name;
                _item.accountAddress = _account.address;
            });

            if (this.dItems.length === 0) {
                this.dItems = delegations;
            } else {
                for (let i = 0, len1 = delegations.length; i < len1; i++) {
                    this.dItems.push(delegations[i]);
                }
            }

            this.totalCount += delegations.length;
            this.$emit('records-count', this.totalCount);

            if (!this.stopLoading) {
                const stakers = await this.fetchStakers();
                if (stakers && stakers.length > 0) {
                    delegations.forEach((_item) => {
                        _item.delegation = {
                            ..._item.delegation,
                            _validator: stakers.find((_staker) => _staker.id === _item.delegation.toStakerId),
                        };
                    });
                }
            }
        },

        /**
         * @param {string} _address Acount address.
         * @return {Promise<[]>}
         */
        async fetchDelegationsByAddress(_address) {
            return this.$fWallet.fetchAll(
                {
                    query: gql`
                        query DelegationsByAddress($address: Address!, $cursor: Cursor, $count: Int!) {
                            delegationsByAddress(address: $address, cursor: $cursor, count: $count) {
                                pageInfo {
                                    first
                                    last
                                    hasNext
                                    hasPrevious
                                }
                                totalCount
                                edges {
                                    cursor
                                    delegation {
                                        toStakerId
                                        createdTime
                                        amount
                                        isDelegationLocked
                                        lockedFromEpoch
                                        lockedUntil
                                        pendingRewards {
                                            amount
                                        }
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        address: _address,
                        count: 100,
                        cursor: null,
                    },
                    fetchPolicy: 'network-only',
                },
                'delegationsByAddress'
            );
        },

        async fetchStakers() {
            const data = await this.$apollo.query({
                query: gql`
                    query Stakers {
                        stakers {
                            id
                            stakerAddress
                            stakerInfo {
                                name
                                website
                                contact
                                logoUrl
                            }
                        }
                    }
                `,
                fetchPolicy: 'network-only',
            });

            return data.data.stakers;
        },

        onDetailLinkClick(_event) {
            _event.preventDefault();
        },

        onClaimRewardsLinkClick(_event, _item, _reStake = false) {
            _event.preventDefault();
            _event.stopPropagation();

            this.$emit('claim-rewards', {
                delegation: _item.delegation,
                accountAddress: _item.accountAddress,
                reStake: _reStake,
                fromDelegationList: true,
            });
        },
    },
};
</script>
