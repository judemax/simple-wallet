export interface ITGBaseOptions {
    readonly chat_id: string | number;
}

export interface ITGGetUpdatesOptions {
    offset?: number;
}

export interface ITGUser {
    readonly id: number;
    readonly is_bot: boolean;
    readonly first_name: string;
    readonly last_name?: string;
    readonly username?: string;
    readonly language_code?: string;
    readonly is_premium?: boolean;
    readonly added_to_attachment_menu?: boolean;
    readonly can_join_groups?: boolean;
    readonly can_read_all_group_messages?: boolean;
    readonly supports_inline_queries?: boolean;
}

export interface ITGLocation {
    readonly longitude: number;
    readonly latitude: number;
    readonly horizontal_accuracy?: number;
    readonly live_period?: number;
    readonly heading?: number;
    readonly proximity_alert_radius?: number;
}

export interface ITGShippingAddress {
    readonly country_code: string;
    readonly state: string;
    readonly city: string;
    readonly street_line1: string;
    readonly street_line2: string;
    readonly post_code: string;
}

export interface ITGLinkPreviewOptions {
    readonly is_disabled?: boolean;
    readonly url?: string;
    readonly prefer_small_media?: boolean;
    readonly prefer_large_media?: boolean;
    readonly show_above_text?: boolean;
}

export interface ITGPhotoSize {
    readonly file_id: string;
    readonly file_unique_id: string;
    readonly width: number;
    readonly height: number;
    readonly file_size?: number;
}

export interface ITGVideo extends ITGPhotoSize {
    readonly duration: number;
    readonly thumbnail?: ITGPhotoSize;
    readonly file_name?: string;
    readonly mime_type?: string;
}

export interface ITGOrderInfo {
    readonly name?: string;
    readonly phone_number?: string;
    readonly email?: string;
    readonly shipping_address?: ITGShippingAddress;
}

export interface ITGMessageEntity {
    readonly type: string;
    readonly offset: number;
    readonly length: number;
    readonly url?: string;
    readonly user?: ITGUser;
    readonly language?: string;
    readonly custom_emoji_id?: string;
}

export interface ITGPollOption {
    readonly text: string;
    readonly voter_count: number;
}

export interface ITGPoll {
    readonly id: string;
    readonly question: string;
    readonly options: ReadonlyArray<ITGPollOption>;
    readonly total_voter_count: number;
    readonly is_closed: boolean;
    readonly is_anonymous: boolean;
    readonly type: string;
    readonly allows_multiple_answers: boolean;
    readonly correct_option_id?: number;
    readonly explanation?: string;
    readonly explanation_entities?: ReadonlyArray<ITGMessageEntity>;
    readonly open_period?: number;
    readonly close_date?: number;
}

export interface ITGChat {
    readonly id: number;
    readonly type: "private" | "group" | "supergroup" | "channel";
    readonly title?: string;
    readonly username?: string;
    readonly first_name?: string;
    readonly last_name?: string;
    readonly is_forum?: boolean;
    // ...
}

export interface ITGPollAnswer {
    readonly poll_id: string;
    readonly voter_chat: ITGChat;
    readonly user: ITGUser;
    readonly option_ids: ReadonlyArray<number>;
}

export interface ITGMessageOriginUser {
    readonly type: "user";
    readonly date: number;
    readonly sender_user: ITGUser;
}

export interface ITGMessageOriginHiddenUser {
    readonly type: "hidden_user";
    readonly date: number;
    readonly sender_user_name: string;
}

export interface ITGMessageOriginChat {
    readonly type: "chat";
    readonly date: number;
    readonly sender_chat: ITGChat;
    readonly author_signature?: string;
}

export interface ITGMessageOriginChannel {
    readonly type: "channel";
    readonly date: number;
    readonly chat: ITGChat;
    readonly message_id: number;
    readonly author_signature?: string;
}

export type ITGMessageOrigin = ITGMessageOriginUser
| ITGMessageOriginHiddenUser
| ITGMessageOriginChat
| ITGMessageOriginChannel;

export interface ITGExternalReplyInfo {
    readonly origin: ITGMessageOrigin;
    readonly chat?: ITGChat;
    readonly message_id?: number;
    // ...
}

export interface ITGTextQuote {
    readonly text: string;
    readonly entities?: ReadonlyArray<ITGMessageEntity>;
    readonly position: number;
    readonly is_manual?: boolean;
}

export interface ITGAnimation {
    readonly file_id: string;
    readonly file_unique_id: string;
    readonly width: number;
    readonly height: number;
    readonly duration: number;
    readonly thumbnail?: ITGPhotoSize;
    readonly file_name?: string;
    readonly mime_type?: string;
    readonly file_size?: number;
}

export interface ITGAudio {
    readonly file_id: string;
    readonly file_unique_id: string;
    readonly duration: number;
    readonly performer?: string;
    readonly title?: string;
    readonly file_name?: string;
    readonly mime_type?: string;
    readonly file_size?: number;
    readonly thumbnail?: ITGPhotoSize;
}

export interface ITGDocument {
    readonly file_id: string;
    readonly file_unique_id: string;
    readonly thumbnail?: ITGPhotoSize;
    readonly file_name?: string;
    readonly mime_type?: string;
    readonly file_size?: number;
}

export interface ITGPaidMedia {
    readonly type: "preview" | "photo" | "video";
}

export interface ITGPaidMediaPreview extends ITGPaidMedia {
    readonly type: "preview";
    readonly width?: number;
    readonly height?: number;
    readonly duration?: number;
}

export interface ITGPaidMediaPhoto extends ITGPaidMedia {
    readonly type: "photo";
    readonly photo: ReadonlyArray<ITGPhotoSize>;
}

export interface ITGPaidMediaVideo extends ITGPaidMedia {
    readonly type: "video";
    readonly video: ITGVideo;
}

export interface ITGPaidMediaInfo {
    readonly star_count: number;
    readonly paid_media: ReadonlyArray<ITGPaidMediaPreview | ITGPaidMediaPhoto | ITGPaidMediaVideo>;
}

export interface ITGMessage {
    readonly message_id: number;
    readonly message_thread_id?: number;
    readonly from?: ITGUser;
    readonly sender_chat?: ITGChat;
    readonly date: number;
    readonly chat: ITGChat;
    readonly forward_origin?: ITGMessageOrigin;
    readonly is_topic_message?: boolean;
    readonly is_automatic_forward?: boolean;
    readonly reply_to_message?: ITGMessage;
    readonly external_reply?: ITGExternalReplyInfo;
    readonly quote?: ITGTextQuote;
    readonly via_bot?: ITGUser;
    readonly edit_date?: number;
    readonly has_protected_content?: boolean;
    readonly media_group_id?: string;
    readonly author_signature?: string;
    readonly text?: string;
    readonly entities?: ReadonlyArray<ITGMessageEntity>;
    readonly link_preview_options?: ITGLinkPreviewOptions;
    readonly animation?: ITGAnimation;
    readonly audio?: ITGAudio;
    readonly document?: ITGDocument;
    readonly paid_media?: ITGPaidMediaInfo;
    readonly photo?: ReadonlyArray<ITGPhotoSize>;
    // ...
    readonly caption?: string;
    // ...
}

export interface ITGInaccessibleMessage {
    readonly chat: ITGChat;
    readonly message_id: number;
    readonly date: 0;
}

export type ITGMaybeInaccessibleMessage = ITGMessage | ITGInaccessibleMessage;

export interface ITGReactionTypeEmoji {
    readonly type: "emoji";
    readonly emoji: string;
}

export interface ITGReactionTypeCustomEmoji {
    readonly type: "custom_emoji";
    readonly custom_emoji_id: string;
}

export type ITGReactionType = ITGReactionTypeEmoji | ITGReactionTypeCustomEmoji;

export interface ITGMessageReactionUpdated {
    readonly chat: ITGChat;
    readonly message_id: number;
    readonly user?: ITGUser;
    readonly actor_chat: ITGChat;
    readonly date: number;
    readonly old_reaction: ReadonlyArray<ITGReactionType>;
    readonly new_reaction: ReadonlyArray<ITGReactionType>;
}

export interface ITGReactionCount {
    readonly type: ITGReactionType;
    readonly total_count: number;
}

export interface ITGMessageReactionCountUpdated {
    readonly chat: ITGChat;
    readonly message_id: number;
    readonly date: number;
    readonly reactions: ReadonlyArray<ITGReactionCount>;
}

export interface ITGInlineQuery {
    readonly id: string;
    readonly from: ITGUser;
    readonly query: string;
    readonly offset: string;
    readonly chat_type?: string;
    readonly location: ITGLocation;
}

export interface ITGChosenInlineResult {
    readonly result_id: string;
    readonly from: ITGUser;
    readonly location?: ITGLocation;
    readonly inline_message_id?: string;
    readonly query: string;
}

export interface ITGCallbackQuery {
    readonly id: string;
    readonly from: ITGUser;
    readonly message?: ITGMaybeInaccessibleMessage;
    readonly inline_message_id?: string;
    readonly chat_instance: string;
    readonly data?: string;
    readonly game_short_name?: string;
}

export interface ITGShippingQuery {
    readonly id: string;
    readonly from: ITGUser;
    readonly invoice_payload: string;
    readonly shipping_address: ITGShippingAddress;
}

export interface ITGPreCheckoutQuery {
    readonly id: string;
    readonly from: ITGUser;
    readonly currency: string;
    readonly total_amount: number;// smallest units
    readonly invoice_payload: string;
    readonly shipping_option_id?: string;
    readonly order_info?: ITGOrderInfo;
}

export interface ITGChatInviteLink {
    readonly invite_link: string;
    readonly creator: ITGUser;
    readonly creates_join_request: boolean;
    readonly is_primary: boolean;
    readonly is_revoked: boolean;
    readonly name?: string;
    readonly expire_date?: number;
    readonly member_limit?: number;
    readonly pending_join_request_count?: number;
}

export interface ITGChatMemberBase {
    readonly status: string;
    readonly user: ITGUser;
    readonly is_anonymous: boolean;
    readonly custom_title?: string;
}

export interface ITGChatMemberOwner extends ITGChatMemberBase {
    readonly status: "creator";
}

export interface ITGChatMemberAdministrator extends ITGChatMemberBase {
    readonly status: "administrator";
}

export interface ITGChatMemberMember extends ITGChatMemberBase {
    readonly status: "member";
}

export interface ITGChatMemberRestricted extends ITGChatMemberBase {
    readonly status: "restricted";
}

export interface ITGChatMemberLeft extends ITGChatMemberBase {
    readonly status: "left";
}

export interface ITGChatMemberBanned extends ITGChatMemberBase {
    readonly status: "kicked";
}

export type ITGChatMember = ITGChatMemberOwner
| ITGChatMemberAdministrator
| ITGChatMemberMember
| ITGChatMemberRestricted
| ITGChatMemberLeft
| ITGChatMemberBanned;

export interface ITGChatMemberUpdated {
    readonly chat: ITGChat;
    readonly from: ITGUser;
    readonly date: number;
    readonly old_chat_member: ITGChatMember;
    readonly new_chat_member: ITGChatMember;
    readonly invite_link?: ITGChatInviteLink;
    readonly via_chat_folder_invite_link?: boolean;
}

export interface ITGChatJoinRequest {
    readonly chat: ITGChat;
    readonly from: ITGUser;
    readonly user_chat_id: number;
    readonly date: number;
    readonly bio?: string;
    readonly invite_link?: ITGChatInviteLink;
}

export interface ITGChatBoostSource {
    readonly source: string;
    readonly user: ITGUser;
}

export interface ITGChatBoost {
    readonly boost_id: string;
    readonly add_date: number;
    readonly expiration_date: number;
    readonly source: ITGChatBoostSource;
}

export interface ITGChatBoostUpdated {
    readonly chat: ITGChat;
    readonly boost: ITGChatBoost;
}

export interface ITGChatBoostRemoved {
    readonly chat: ITGChat;
    readonly boost_id: string;
    readonly remove_date: number;
    readonly source: ITGChatBoostSource;
}

export interface ITGUpdate {
    readonly update_id: number;
    readonly message?: ITGMessage;
    readonly edited_message?: ITGMessage;
    readonly channel_post?: ITGMessage;
    readonly edited_channel_post?: ITGMessage;
    readonly message_reaction?: ITGMessageReactionUpdated;
    readonly message_reaction_count?: ITGMessageReactionCountUpdated;
    readonly inline_query?: ITGInlineQuery;
    readonly chosen_inline_result?: ITGChosenInlineResult;
    readonly callback_query?: ITGCallbackQuery;
    readonly shipping_query?: ITGShippingQuery;
    readonly pre_checkout_query?: ITGPreCheckoutQuery;
    readonly poll?: ITGPoll;
    readonly poll_answer?: ITGPollAnswer;
    readonly my_chat_member?: ITGChatMemberUpdated;
    readonly chat_member?: ITGChatMemberUpdated;
    readonly chat_join_request?: ITGChatJoinRequest;
    readonly chat_boost?: ITGChatBoostUpdated;
    readonly removed_chat_boost?: ITGChatBoostRemoved;
}

export interface ITGGetUpdates {
    readonly ok: boolean;
    readonly result?: ReadonlyArray<ITGUpdate>;
}

export interface IWebhookTGHandleOptions {
    readonly key: string;
    readonly botType: string;
    readonly secretToken: string;
}

export interface ITGInlineKeyboardButton {
    readonly text: string;
    readonly url?: string;
    readonly callback_data?: string;
}

export interface ITGFile {
    readonly file_id: string;
    readonly file_unique_id: string;
    readonly file_size: string;
    readonly file_path: string;
}

export interface ITGFileResult {
    readonly ok: boolean;
    readonly result?: ITGFile;
}

export interface ITGSendPhotoResult {
    readonly ok: boolean;
    readonly result?: ITGMessage;
}
