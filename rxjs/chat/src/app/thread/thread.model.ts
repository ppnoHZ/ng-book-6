import { uuid } from "../util/uuid";

export class Thread {
    id: string;
    lastMessage: any;
    name: string;
    avatarScr: string;
    constructor(id?, name?: string, avatarSrc?: string) {
        this.id = id || uuid();
        this.name = name;
        this.avatarScr = this.avatarScr;
    }
}