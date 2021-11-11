import appConfig from '../../../app.config.js';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { store } from '@/store';
import { SET_WALLETCONNECT_ACCOUNT, SET_WALLETCONNECT_CHAIN_ID } from '@/plugins/walletconnect/store.js';
const OPERA_CHAIN_ID = appConfig.chainId;

/** @type {WalletConnect} */
export let walletConnect = null;

/**
 * Plugin for communication with WalletConnect.
 */
export class WalletConnect {
    /**
     * @param {Vue} _Vue
     */
    static install(_Vue) {
        if (!walletConnect) {
            walletConnect = new WalletConnect();
            _Vue.prototype.$walletConnect = walletConnect;
        }
    }

    constructor() {
        this.selectedAddress = '';
        this.chainId = '';

        /**
         * WalletConnect provider.
         *
         * @type {null}
         * @private
         */
        this._provider = null;
        this._walletConnect = null;
        this._initialized = false;
        this._web3 = null;

        this.init();
    }

    async init() {
        if (!this._initialized && !appConfig.isChromeExtension) {
            this._provider = new WalletConnectProvider({
                // infuraId: '27e484dcd9e3efcfd25a83a78777cdf1',
                rpc: {
                    250: 'https://rpc.ftm.tools/',
                },
                chainId: 250,
            });

            /*if (!this._walletConnect.connected) {
                await this._walletConnect.createSession();
            }*/

            const provider = this._provider;

            this._web3 = new Web3(provider);

            provider.on('chainChanged', (_chainId) => {
                this._onChainChange(_chainId);
            });
            provider.on('accountsChanged', (_accounts) => {
                this._onAccountsChange(_accounts);
            });
            provider.on('disconnect', () => {
                this._setChainId(0);
                this._setAccount('');
                window.location.reload();
            });

            console.log('!!!');

            this._setChainId(provider.chainId);
            this._setAccount(await this.getAccounts());
        }

        this._initialized = true;
    }

    /**
     * Called on chainId change.
     *
     * @param {string} _chainId Hex number.
     * @private
     */
    _onChainChange(_chainId) {
        this._setChainId(_chainId);
    }

    /**
     * Called on account change.
     *
     * @param {array} _accounts
     * @private
     */
    _onAccountsChange(_accounts) {
        this._setAccount(_accounts);
    }

    async connect() {
        const accounts = await this._provider.enable();

        this._setChainId(this._provider.chainId);
        this._setAccount(accounts);

        return accounts;
    }

    async disconnect() {
        console.log('disconnect walletconnect');

        if (this._provider) {
            await this._provider.disconnect();
        }
    }

    /**
     * @return {boolean}
     */
    isCorrectChainId(chainId) {
        return this.chainId === (chainId || parseInt(OPERA_CHAIN_ID, 16));
    }

    /**
     * @return {Promise<[]>}
     */
    async getAccounts() {
        let accounts = [];

        if (this._provider) {
            try {
                accounts = await this._provider.request({ method: 'eth_accounts' });
            } catch (_error) {
                console.error(_error);
            }
        }

        return accounts;
    }

    async signTransaction(_tx, _address) {
        _tx.from = _address;

        if (!this.selectedAddress) {
            await this.connect();
        }

        console.log('sign', JSON.stringify(_tx));

        return await this._provider.request({
            method: 'eth_sendTransaction',
            params: [_tx],
        });
    }

    /**
     * @param {string} _chainId Hex number.
     * @private
     */
    _setChainId(_chainId) {
        console.log('_setChainId', _chainId);
        this.chainId = _chainId;
        store.commit(`walletConnect/${SET_WALLETCONNECT_CHAIN_ID}`, _chainId);
    }

    _setAccount(accounts) {
        this.selectedAddress = accounts[0] || '';
        console.log('_setAccount', this.selectedAddress);
        store.commit(`walletConnect/${SET_WALLETCONNECT_ACCOUNT}`, this.selectedAddress);
    }
}
