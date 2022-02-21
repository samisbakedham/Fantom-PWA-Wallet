<template>
    <div class="tx-confirmation-window">
        <f-window
            ref="win"
            modal
            class="tx-confirmation-f-window"
            animation-in="scale-center-enter-active"
            animation-out="scale-center-leave-active"
            no-controls
            :hide-on-escape-key="false"
            :body-min-height="bodyMinHeight"
            @window-hide="$emit('window-hide', $event)"
        >
            <template #title>
                <h2 data-focus>Confirmation</h2>
                <f-steps v-if="stepsCount > 0" :labels="stepLabels" :active="dActiveStep" />
            </template>
            <slot>
                <f-view-transition :views-structure="viewsStructure" :app-node-id="currentAppNodeId" class="min-h-100">
                    <component
                        :is="currentComponent"
                        v-bind="currentComponentProperties"
                        @change-component="onChangeComponent"
                        @cancel-button-click="onCancelButtonClick"
                        @step="onStep"
                    ></component>
                </f-view-transition>
            </slot>
        </f-window>
    </div>
</template>

<script>
import FWindow from '@/components/core/FWindow/FWindow.vue';
import FSteps from '@/components/core/FSteps/FSteps.vue';
import { componentViewMixin } from '@/mixins/component-view.js';
import FViewTransition from '@/components/core/FViewTransition/FViewTransition.vue';
import TransactionSuccessMessage from '@/components/TransactionSuccessMessage/TransactionSuccessMessage.vue';

export default {
    name: 'TxConfirmationWindow',

    components: { FViewTransition, FSteps, FWindow, TransactionSuccessMessage },

    mixins: [componentViewMixin],

    props: {
        /** Minimal height of window's body. */
        bodyMinHeight: {
            type: String,
            default: 'auto',
        },
        /** Count of steps */
        stepsCount: {
            type: Number,
            default: 0,
        },
        /** Active step (`<1, stepsCount>`) */
        activeStep: {
            type: Number,
            default: 1,
        },
        structureRootNode: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            currentComponent: '',
            viewsStructureRootNode: this.structureRootNode,
            dActiveStep: this.activeStep,
            cancelBtnClicked: true,
        };
    },

    computed: {
        stepLabels() {
            const labels = [];
            const { stepsCount } = this;

            if (stepsCount > 0) {
                for (let i = 0; i < stepsCount; i++) {
                    labels.push(`Step ${i + 1}`);
                }
            }

            labels.push('Finished');

            return labels;
        },
    },

    methods: {
        show() {
            this.$refs.win.show();
        },

        hide() {
            this.$refs.win.hide();
        },

        onCancelButtonClick() {
            this.$refs.win.hide();
            this.currentAppNodeId = '';
            this.currentComponent = '';
            this.dActiveStep = 1;

            this.$emit('cancel-button-click', this.cancelBtnClicked);

            this.cancelBtnClicked = true;
        },

        /**
         * @param {Object} _data
         */
        onChangeComponent(_data) {
            const { data } = _data;

            if (data && data.continueTo === 'hide-window') {
                this.cancelBtnClicked = false;
            }

            componentViewMixin.methods.onChangeComponent.call(this, _data);
        },

        onStep(step) {
            this.dActiveStep = step;
        },
    },
};
</script>

<style lang="scss">
@import 'style';
</style>
