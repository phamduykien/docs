"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function (resolve) {
            resolve(value);
        });
    }
    return new(P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
const WaxEventSource_1 = require("./WaxEventSource");
class WaxSigningApi {
    constructor(waxSigningURL, waxAutoSigningURL) {
        this.waxSigningURL = waxSigningURL;
        this.waxAutoSigningURL = waxAutoSigningURL;
        this.waxEventSource = new WaxEventSource_1.WaxEventSource(waxSigningURL);
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.user) {
                yield this.loginViaWindow();
            }
            if (this.user) {
                return this.user;
            }
            throw new Error("Login failed");
        });
    }
    tryAutologin() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.user) {
                return true;
            }
            try {
                yield this.loginViaEndpoint();
                return true;
            } catch (e) {
                return false;
            }
        });
    }
    prepareTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.canAutoSign(transaction)) {
                //this.signingWindow = yield this.waxEventSource.openPopup(`${this.waxSigningURL}/cloud-wallet/signing/`);
            }
        });
    }
    signing(transaction, serializedTransaction, noModify = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = [];
            serializedTransaction.forEach(element => {
                arr.push(element);
            });
            
            const signUrl = this.signUrl;
            const accessToken=this.accessToken;
            const response = yield fetch(signUrl || `/wam/sign`, {
                //credentials: "include",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': accessToken,
                },
                body: JSON.stringify({
                    "serializedTransaction": arr,
                    "website": "localhost:8080",
                    "description": "jwt is insecure",
                    "freeBandwidth": true
                })

            });

            if (!response.ok) {
                this.whitelistedContracts = [];
                throw new Error(`Signing Endpoint Error ${response.status} ${response.statusText}`);
            }
            const data = yield response.json();
            return data;


            if (this.canAutoSign(transaction)) {
                try {
                    return yield this.signViaEndpoint(serializedTransaction, noModify);
                } catch (_a) {
                    // handle by continuing
                }
            }
            return yield this.signViaWindow(serializedTransaction, this.signingWindow, noModify);
        });
    }
    loginViaWindow() {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmationWindow = yield this.waxEventSource.openEventSource(`${this.waxSigningURL}/cloud-wallet/login/`);
            return this.waxEventSource.onceEvent(confirmationWindow, this.waxSigningURL, this.receiveLogin.bind(this), undefined);
        });
    }
    loginViaEndpoint() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this.waxAutoSigningURL}login`, {
                credentials: "include",
                method: "get"
            });
            if (!response.ok) {
                throw new Error(`Login Endpoint Error ${response.status} ${response.statusText}`);
            }
            const data = yield response.json();
            if (data.processed && data.processed.except) {
                throw new Error(data);
            }
            return this.receiveLogin({
                data
            });
        });
    }
    signViaEndpoint(serializedTransaction, noModify = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 5000);
            const response = yield fetch(`${this.waxAutoSigningURL}signing`, {
                body: JSON.stringify({
                    freeBandwidth: !noModify,
                    transaction: Object.values(serializedTransaction)
                }),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                signal: controller.signal
            });
            if (!response.ok) {
                this.whitelistedContracts = [];
                throw new Error(`Signing Endpoint Error ${response.status} ${response.statusText}`);
            }
            const data = yield response.json();
            if (data.processed && data.processed.except) {
                this.whitelistedContracts = [];
                throw new Error(`Error returned from signing endpoint: ${JSON.stringify(data)}`);
            }
            return this.receiveSignatures({
                data
            });
        });
    }
    signViaWindow(serializedTransaction, window, noModify = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmationWindow = yield this.waxEventSource.openEventSource(`${this.waxSigningURL}/cloud-wallet/signing/`, {
                freeBandwidth: !noModify,
                transaction: serializedTransaction,
                type: "TRANSACTION"
            }, window);
            return this.waxEventSource.onceEvent(confirmationWindow, this.waxSigningURL, this.receiveSignatures.bind(this), "TX_SIGNED");
        });
    }
    receiveLogin(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const {
                verified,
                userAccount,
                pubKeys,
                whitelistedContracts
            } = event.data;
            if (!verified) {
                throw new Error("User declined to share their user account");
            }
            if (!userAccount || !pubKeys) {
                throw new Error("User does not have a blockchain account");
            }
            this.whitelistedContracts = whitelistedContracts || [];
            this.user = {
                account: userAccount,
                keys: pubKeys
            };
            return true;
        });
    }
    receiveSignatures(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.data.type === "TX_SIGNED") {
                const {
                    verified,
                    signatures,
                    whitelistedContracts,
                    serializedTransaction
                } = event.data;
                if (!verified || !signatures) {
                    throw new Error("User declined to sign the transaction");
                }
                this.whitelistedContracts = whitelistedContracts || [];
                return {
                    serializedTransaction,
                    signatures
                };
            }
            throw new Error(`Unexpected response received when attempting signing: ${JSON.stringify(event.data)}`);
        });
    }
    canAutoSign(transaction) {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.search("chrome") === -1 && ua.search("safari") >= 0) {
            return false;
        }
        return !transaction.actions.find(action => !this.isWhitelisted(action));
    }
    isWhitelisted(action) {
        return !!(this.whitelistedContracts &&
            !!this.whitelistedContracts.find((w) => {
                if (w.contract === action.account) {
                    if (action.account === "eosio.token" && action.name === "transfer") {
                        return w.recipients.includes(action.data.to);
                    }
                    return true;
                }
                return false;
            }));
    }
}
exports.WaxSigningApi = WaxSigningApi;