export interface ISupertestResponse<T> {
    readonly status: number;
    readonly body: T;
    readonly headers: object;
    readonly res?: {
        readonly statusMessage: string;
    };
    readonly text?: string;
}
