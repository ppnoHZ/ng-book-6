import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";

import { map, filter, scan, publishReplay, refCount } from "rxjs/operators";

import { Message } from "./message.model";
import { Thread } from "../thread/thread.model";
import { User } from "../user/user.model";

const initialMessages: Message[] = [];

interface IMessagesOperation extends Function {
    (messages: Message[]): Message[];
}


@Injectable()
export class MessagesService {
    newMessages: Subject<Message> = new Subject<Message>();

    messages: Observable<Message[]>;

    updates: Subject<any> = new Subject<any>();

    create: Subject<Message> = new Subject<Message>();

    markThreadAsRead: Subject<any> = new Subject<any>();

    constructor() {
        this.messages = this.updates.pipe(
            //累加S
            scan((messages: Message[], operation: IMessagesOperation) => {
                console.log('messages scan:', operation)
                return operation(messages);
            }, initialMessages),
            //为新的订阅者缓存一个数据
            publishReplay(1),
            //当有第一个订阅者，Observable自动执行
            refCount()
        )

        this.create.pipe(
            //返回一个方法给 Updates流
            map(function (message: Message): IMessagesOperation {
                console.log('create map1: ' + message.text);
                return (messages: Message[]) => {
                    let ms = messages.concat(message);
                    console.log('create map2:', ms.length);
                    return ms;
                }
            })
        ).subscribe(this.updates);

        this.newMessages.subscribe(this.create);

        this.markThreadAsRead.pipe(
            map((thread: Thread) => {
                return (messages: Message[]) => {
                    return messages.map((message: Message) => {
                        if (message.thread.id === thread.id) {
                            message.isRead = true;
                        }
                        return message;
                    })
                }
            })

        ).subscribe(this.updates);
    }
    addMessage(newMessage: Message) {
        this.newMessages.next(newMessage);
        // this.updates.next((message: Message[]): Message[] => {
        //     return message.concat(newMessage);
        // })
    }

    messagesForThreadUser(thread: Thread, user: User): Observable<Message> {
        return this.newMessages.pipe(
            filter((message: Message) => {
                return (message.thread.id === thread.id) && (message.author.id !== user.id)
            }));
    }
}