export class AssertionError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

export function assertion(
    condition: boolean | number | string | object | undefined,
    errorCode: string,
    errorMessage: string,
): boolean {
    if (condition) {
        return true;
    }
    throw new AssertionError(errorCode, errorMessage);
}
