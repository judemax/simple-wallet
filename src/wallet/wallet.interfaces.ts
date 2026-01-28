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

export interface IWalletEncryptedItem {
    readonly walletSalt: string;
    readonly encrypted: string;
}
