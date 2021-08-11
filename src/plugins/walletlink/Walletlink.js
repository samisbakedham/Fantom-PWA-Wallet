import appConfig from '../../../app.config.js';
// import Web3 from 'web3';
import WalletLink from 'walletlink';
import Web3 from 'web3';
const OPERA_CHAIN_ID = appConfig.chainId;

/** @type {Walletlink} */
export let walletlink = null;

/**
 * Plugin for communication with Walletlink.
 */
export class Walletlink {
    /**
     * @param {Vue} _Vue
     */
    static install(_Vue) {
        if (!walletlink) {
            walletlink = new Walletlink();
            _Vue.prototype.$walletlink = walletlink;
        }
    }

    constructor() {
        this.selectedAddress = '';

        /**
         * Walletlink provider.
         *
         * @type {null}
         * @private
         */
        this._provider = null;
        this._walletLink = null;
        this._initialized = false;
        this._web3 = null;

        this.init();
    }

    async init() {
        if (!this._initialized && !appConfig.isChromeExtension) {
            this._walletLink = new WalletLink({
                appName: appConfig.name,
                // appLogoUrl: 'https://ftmscan.com/images/svg/brands/fantom.svg?v=1.3',
                // appLogoUrl: 'https://seeklogo.com/images/F/fantom-ftm-logo-3566C53917-seeklogo.com.png',
                appLogoUrl:
                    'https://play-lh.googleusercontent.com/R3re-12NV0ImOlXiem3jMUwnjFlWJOQix0G5aRZxuPA1-Kli0z2KMwR0lvL71lRhdms=s180-rw',
                darkMode: false,
            });

            this._provider = this._walletLink.makeWeb3Provider(appConfig.mainnet.rpc, appConfig.mainnet.chainId);
            this._web3 = new Web3(this._provider);

            this.selectedAddress = this._provider.selectedAddress || '';
        }

        this._initialized = true;
    }

    async connect() {
        const accounts = await this._provider
            .enable()
            .then((accounts) => {
                return accounts;
            })
            .catch((error) => {
                return Promise.reject(error);
            });

        this._web3.eth.defaultAccount = accounts[0];
        this.selectedAddress = accounts[0];

        console.log('accounts: ', accounts, this._provider);

        return accounts;
    }

    async disconnect() {
        await this._walletLink.disconnect();

        this._web3.eth.defaultAccount = null;
        this.selectedAddress = '';
    }

    /**
     * @return {boolean}
     */
    isCorrectChainId() {
        return this._provider && this._provider.chainId === OPERA_CHAIN_ID;
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

    async requestAccounts() {
        if (this._provider) {
            try {
                return await this._provider.request({ method: 'eth_requestAccounts' });
            } catch (_error) {
                // userRejectedRequest error
                if (_error.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    // If this happens, the user rejected the connection request.
                    console.log('Please connect to MetaMask.');
                } else {
                    console.error(_error);
                }
            }
        }
    }

    async signTransaction(_tx, _address) {
        if (this._provider) {
            _tx.from = _address;

            const txHash = await this._provider.request({
                method: 'eth_sendTransaction',
                params: [_tx],
            });

            return txHash;
        }
    }
}
