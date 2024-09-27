type EventMap = {
  [event: string]: any
}

type EventCallback<Payload = any> = (payload: Payload) => void

class EventBus<Events extends EventMap = EventMap> {
  private events: {
    [K in keyof Events]?: Set<EventCallback<Events[K]>>
  } = {}

  on<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>) {
    if (!this.events[event]) {
      this.events[event] = new Set()
    }
    this.events[event]!.add(callback)
  }

  once<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>) {
    const onceCallback: EventCallback<Events[K]> = (payload) => {
      callback(payload)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    if (this.events[event]) {
      const callbacks = Array.from(this.events[event]!)
      for (const callback of callbacks) {
        try {
          callback(payload)
        } catch (error) {
          console.error(
            `Error in event listener for event "${String(event)}":`,
            error
          )
        }
      }
    }
  }

  off<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>) {
    if (this.events[event]) {
      this.events[event]!.delete(callback)
      if (this.events[event]!.size === 0) {
        delete this.events[event]
      }
    }
  }

  removeAllListeners<K extends keyof Events>(event: K) {
    if (this.events[event]) {
      delete this.events[event]
    }
  }

  hasListeners<K extends keyof Events>(event: K): boolean {
    return !!(this.events[event] && this.events[event]!.size > 0)
  }
}

export const eventBus = new EventBus<{
  mention: { from: string; message: string }
  dm: { from: string; message: string }
  refreshNoteSubscription: {}
}>()
