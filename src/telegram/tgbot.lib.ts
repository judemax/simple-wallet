import {
    ITGBaseOptions,
    ITGFile,
    ITGFileResult,
    ITGGetUpdates,
    ITGGetUpdatesOptions, ITGUpdate,
} from "./tgbot.interfaces";
import {TTGCB} from "./tgbot.types";

export class TGBot {
    protected readonly token: string;
    protected webhook: string;
    protected readonly tgServer: string;
    protected cb: TTGCB | null;

    constructor(token: string, tgServer?: string) {
        this.token = token || "test";
        this.tgServer = tgServer || "https://api.telegram.org";
        this.webhook = "";
        this.cb = null;
    }

    private async realAPIRequest<P, R>(method: string, parameters: P): Promise<R | null> {
        const r: Response = await fetch(`${this.tgServer}/bot${this.token}/${method}`, {
            headers: {
                "content-type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(parameters),
            method: "POST",
        });
        return r.json();
    }

    private apiRequest<P, R>(method: string, parameters: P): Promise<R | null> {
        if (this.token.includes("test")) {
            return Promise.resolve(null);
        }
        return this.realAPIRequest(method, parameters);
    }

    getBotId(): string {
        return this.token.split(":")[0];
    }

    setWebhook(webhook: string, secretToken: string) {
        this.webhook = webhook;
        return this.apiRequest("setWebhook", {
            url: webhook,
            secret_token: secretToken,
            allowed_updates: [
                "message",
                "edited_channel_post",
                "callback_query",
                "chat_member",
                "message_reaction",
                "message_reaction_count",
            ],
        });
    }

    deleteWebhook<P, R>(options: P): Promise<R | null> {
        return this.apiRequest("deleteWebhook", {...options});
    }

    sendMessage<P extends ITGBaseOptions, R>(text: string, options: P): Promise<R | null> {
        if (!options.chat_id) {
            return Promise.resolve(null);
        }
        return this.apiRequest("sendMessage", {
            text,
            disable_web_page_preview: true,
            disable_notification: false,
            parse_mode: "HTML",
            ...options,
        });
    }

    editMessageReplyMarkup<P extends ITGBaseOptions, R>(
        chatId: string,
        messageId: number,
        replyMarkup: string,
        options: P,
    ): Promise<R | null> {
        return this.apiRequest("editMessageReplyMarkup", {
            message_id: messageId,
            reply_markup: replyMarkup,
            ...options,
            chat_id: chatId,
        });
    };

    editMessage<P extends ITGBaseOptions, R>(
        chatId: string,
        messageId: number,
        text: string,
        options: P,
    ): Promise<R | null> {
        return this.apiRequest("editMessageText", {
            message_id: messageId,
            disable_web_page_preview: true,
            disable_notification: false,
            parse_mode: "HTML",
            text,
            ...options,
            chat_id: chatId,
        });
    }

    getUpdates(offset: number = 0): Promise<ITGGetUpdates | null> {
        const parameters: ITGGetUpdatesOptions = {};
        if (offset > 0) {
            parameters.offset = offset;
        }
        return this.apiRequest("getUpdates", parameters);
    }

    async sendSimpleChatMessage<R>(chatIds: string[], text: string): Promise<R | null> {
        let lastResult: R | null = null;
        text = text.trim().split("\n").map(l => l.trim()).join("\n");
        for (const chatId of chatIds) {
            lastResult = await this.sendMessage(text, {chat_id: chatId});
        }
        return lastResult;
    }

    async getFile(fileId: string): Promise<ITGFile | undefined> {
        const file: ITGFileResult | null = await this.apiRequest("getFile", {file_id: fileId});
        return file?.result;
    }

    deleteMessages<R>(chatId: string, messageIds: ReadonlyArray<number>): Promise<R | null> {
        return this.apiRequest("deleteMessages", {
            chat_id: chatId,
            message_ids: messageIds,
        });
    }

    onMessage(cb: TTGCB) {
        this.cb = cb;
    }

    async emit(upd: ITGUpdate) {
        if (!this.cb) {
            return;
        }
        await this.cb(upd);
    }
}
