declare module "src/common/types/eslint-plugin-newline-after-if-condition" {
    import {Rule} from "eslint";

    const plugin: {
        rules: Record<string, Rule.RuleModule>;
    };

    export = plugin;
}
