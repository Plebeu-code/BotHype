import type { ClientEvents } from "discord.js"

export interface IEventProvider<E extends keyof ClientEvents> {
  eventName: string
  main(...args: ClientEvents[E]): Promise<void>
}