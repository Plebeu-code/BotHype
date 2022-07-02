import type { TEvents } from "./TEventHandler";

export interface IEventHandler {
  getEvents(path: string): TEvents[]
}