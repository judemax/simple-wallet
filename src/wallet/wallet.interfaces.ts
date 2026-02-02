export interface IWalletData {
    readonly chatId: string;
    readonly name: string;
    readonly walletSalt: string;
    readonly mnemonicHash: string;
    readonly encrypted: string;
}

export interface IWalletCreationAttributes extends IWalletData {}

export interface IWalletSensitiveData {
    readonly mnemonic: string;
}

export interface IWalletItem {
    readonly chatId: string;
    readonly name: string;
    readonly walletSalt: string;
    readonly mnemonicHash: string;
}

export interface IExtendedWalletItem extends IWalletItem {
    readonly mnemonic: string;
}

export interface IWalletEncryptedItem {
    readonly walletSalt: string;
    readonly encrypted: string;
}

export interface IWalletCreate {
    readonly name: string;
    readonly mnemonic?: string;
}

export interface IWalletUpdate {
    name: string;
}

export interface IWalletAPIResult {
    readonly name: string;
}

export interface IWalletAPIExtendedResult extends IWalletAPIResult {
    readonly mnemonic: string;
}
