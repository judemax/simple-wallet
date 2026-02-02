import {assertion} from "./assertion";
import {IUserEncryptedItem, IUserItem} from "../user/user.interfaces";
import {ITGCommandHandler, ITGCommandPrevStep, ITGCommandState} from "../commands/command.interfaces";
import {IWalletCreate, IWalletItem} from "../wallet/wallet.interfaces";

export class AssertionUtils {
    static doesTGDecoratorExist(command: string) {
        assertion(command, "missing_tg_decorator", `${this.constructor.name} is missing @TGCommand decorator`);
    }

    static doesUserExist(
        userItem: IUserEncryptedItem | IUserItem | null,
    ): asserts userItem is IUserEncryptedItem | IUserItem {
        assertion(!!userItem, "user_not_exists", "User not exists");
    }

    static isCommandKnown(
        handler: ITGCommandHandler | undefined,
        command: string,
    ): asserts handler is ITGCommandHandler {
        assertion(handler, "unknown_command", `Unknown command: ${command}`);
    }

    static doesWalletNameNotExist(condition: boolean, name: string): asserts condition is true {
        assertion(condition, "wallet_with_name_already_exists", `Wallet with name ${name} already exists`);
    }

    static doesMnemonicNotExist(condition: boolean): asserts condition is true {
        assertion(condition, "wrong_wallet", "You cannot add this wallet!");
    }

    static isCorrectMnemonic(condition: boolean): asserts condition is true {
        assertion(condition, "incorrect_mnemonic", "Your mnemonic is incorrect");
    }

    static doesStateExist(state?: ITGCommandState): asserts state is ITGCommandState {
        assertion(!!state, "state_not_exists", "State not exists");
    }

    static doesStepExist(step?: ITGCommandPrevStep): asserts step is ITGCommandPrevStep {
        assertion(!!step, "step_not_exists", "Step not exists");
    }

    static isAPIKeyNotEmpty(apiKey: string) {
        assertion(!!apiKey && typeof apiKey === "string", "key_is_empty", "API key is empty");
    }

    static isValidAPIKey(user: IUserItem | null): asserts user is IUserItem {
        assertion(!!user, "invalid_key", "Invalid key");
    }

    static nameFieldFilled(data: IWalletCreate): asserts data is { name: string } {
        assertion(!!data.name && typeof data.name === "string", "name_not_filled", "Send the name");
    }

    static doesWalletExists(wallet: IWalletItem | null): asserts wallet is IWalletItem {
        assertion(!!wallet, "wallet_not_exists", "Wallet not exists");
    }
}
