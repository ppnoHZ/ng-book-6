import { User } from "../user/user.model";
import { Thread } from "../thread/thread.model";
import { uuid } from "../util/uuid";

export class Message {
    id: string;
    sendAt: Date;
    isRead: boolean;
    text: string;
    author: User;
    thread: Thread;
    constructor(obj?: any) {
        this.id = obj && obj.id || uuid();
        this.isRead = obj && obj.isRead || false;
        this.sendAt = obj && obj.sentAt || new Date();
        this.author = obj && obj.author || null;
        this.text = obj && obj.text || null;
        this.thread = obj && obj.thread || null;
    }
}