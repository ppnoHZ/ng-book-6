import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";
import { User } from "./user.model";

@Injectable()
export class UserService {
    currentUser: Subject<User> = new BehaviorSubject<User>(null);

    public setCurrentUser(newUser: User): void {
        this.currentUser.next(newUser);
    }
}