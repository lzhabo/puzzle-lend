import { makeAutoObservable } from "mobx";
import AccountStore, { ISerializedAccountStore } from "@stores/AccountStore";
import NotificationStore from "@stores/NotificationStore";
import LendStore from "@stores/LendStore";

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
}

export default class RootStore {
  public accountStore: AccountStore;
  public notificationStore: NotificationStore;
  public lendStore: LendStore;

  constructor(initState?: ISerializedRootStore) {
    this.notificationStore = new NotificationStore(this);
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.lendStore = new LendStore(this);

    makeAutoObservable(this);
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize()
  });
}
