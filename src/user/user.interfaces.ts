export interface IUserCreationAttributes {
    readonly chatId: string;
    readonly userSalt: string;
    readonly apiKeyHash: string;
    readonly encrypted: string;
}

export interface IUserData {
    readonly chatId: string;
    readonly userSalt: string;
    readonly apiKeyHash: string;
    readonly encrypted?: string;
}

export interface IUserSensitiveData {
    readonly apiKey: string;
}

export interface IUserItem {
    readonly chatId: string;
    readonly userSalt: string;
    readonly apiKeyHash: string;
}

export interface IUserEncryptedItem {
    readonly userSalt: string;
    readonly encrypted: string;
}
