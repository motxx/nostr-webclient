type EventCallback = (...args: any[]) => void

class EventBus {
  private events: { [key: string]: EventCallback[] } = {}

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(...args))
    }
  }

  off(event: string, callback: EventCallback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback)
    }
  }

  find(event: string) {
    return this.events[event]
  }
}

export const eventBus = new EventBus()
