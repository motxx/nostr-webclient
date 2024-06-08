export class UserStore {
  private storage: Storage
  private npub: string

  constructor(npub: string) {
    this.storage = window.localStorage
    this.npub = npub
  }

  set(key: string, value: any) {
    this.storage.setItem(this.getFullKey(key), JSON.stringify(value))
  }

  get(key: string) {
    const result = this.storage.getItem(this.getFullKey(key))
    return result ? JSON.parse(result) : null
  }

  remove(key: string) {
    this.storage.removeItem(this.getFullKey(key))
  }

  private getFullKey(key: string) {
    return `${this.npub}:${key}`
  }
}
