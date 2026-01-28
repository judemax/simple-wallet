import {assertion} from "./assertion";
import {IUserEncryptedItem, IUserItem} from "../user/user.interfaces";
import {ITGCommandHandler, ITGCommandPrevStep, ITGCommandState} from "../commands/command.interfaces";

export class AssertionUtils {
    static doesTGDecoratorExist(command: string) {
        assertion(command, "missing_tg_decorator", `${this.constructor.name} is missing @TGCommand decorator`);
    }

    static doesUserExist(userItem: IUserEncryptedItem | IUserItem | null) {
        assertion(!!userItem, "user_not_exists", "User not exists");
    }

    static isCommandKnown(handler: ITGCommandHandler, command: string) {
        assertion(handler, "unknown_command", `Unknown command: ${command}`);
    }

    static doesWalletNameNotExist(condition: boolean, name: string) {
        assertion(condition, "wallet_with_name_already_exists", `Wallet with name ${name} already exists`);
    }

    static doesMnemonicNotExist(condition: boolean) {
        assertion(condition, "wrong_wallet", "You cannot add this wallet!");
    }

    static isCorrectMnemonic(condition: boolean) {
        assertion(condition, "incorrect_mnemonic", "Your mnemonic is incorrect");
    }

    static doesStateExist(state: ITGCommandState) {
        assertion(!!state, "state_not_exists", "State not exists");
    }

    static doesStepExist(step: ITGCommandPrevStep) {
        assertion(!!step, "step_not_exists", "Step not exists");
    }
}
