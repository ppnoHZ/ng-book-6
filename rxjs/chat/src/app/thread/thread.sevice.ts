import { Inject, Injectable } from "@angular/core";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { Thread } from "./thread.model";
import { MessagesService } from "../message/message.service";
import { map, combineLatest } from "rxjs/operators";
import { Message } from "../message/message.model";
import * as _ from 'underscore';
@Injectable()
export class ThreadsService {
    /**
     * 所有的会话列表
     */
    threads: Observable<{ [key: string]: Thread }>;

    /**
     * 当前会话
     */
    currentThread: Subject<Thread> = new BehaviorSubject<Thread>(new Thread());

    /**
     * 按倒序排序的会话列表
     */
    orderedThreads: Observable<Thread[]>;
    /**
     * 当前会话的所有消息
     */
    currentThreadMessages: Observable<Message[]>;


    constructor(messageService: MessagesService) {
        this.threads = messageService.messages.pipe(
            map((message: Message[]) => {
                let threads: { [key: string]: Thread } = {};
                //循环所有的消息，根据thread.id创建会话列表。
                message.map((message: Message) => {
                    threads[message.thread.id] = threads[message.thread.id] || message.thread;
                    //处理最后一条消息。
                    let messagesThread: Thread = threads[message.thread.id];
                    if (!messagesThread.lastMessage || messagesThread.lastMessage.sentAt < message.sendAt) {
                        messagesThread.lastMessage = message;
                    }

                });
                return threads;
            })
        );

        this.orderedThreads = this.threads.pipe(
            map((threadGroups: { [key: string]: Thread }) => {
                let threads: Thread[] = _.values(threadGroups);
                return _.sortBy(threads, (t: Thread) => t.lastMessage.sendAt).reverse();
            })
        )


        //合并流，将当前会话改变和有新消息的流和并，就可以拿到当前会话的实时消息。
        this.currentThreadMessages = this.currentThread.pipe(
            combineLatest(
                messageService.messages, (currentThread: Thread, messages: Message[]) => {
                    if (currentThread && messages.length > 0) {
                        return _.chain(messages)
                            .filter((message: Message) =>
                                (message.thread.id === currentThread.id))
                            .map((message: Message) => {
                                message.isRead = true;
                                return message;
                            })
                            .value();
                    } else {
                        return [];
                    }
                }
            )
    
        )
        
        
        //当当前会话改变的时候，让当前列表的所有消息变成已读
        this.currentThread.subscribe(messageService.markThreadAsRead);
    }
    /**
     * 切换当前会话
     * @param newThread 要切换的会话
     */
    setCurrentThread(newThread: Thread) {
        this.currentThread.next(newThread);
    }
}