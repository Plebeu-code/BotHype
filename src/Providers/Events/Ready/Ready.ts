import type { Client } from "discord.js";
import type { IEventProvider } from "../IEventProvider";

export default class ReadyEvent implements IEventProvider<"ready"> {
  public readonly eventName: string = "ready";
  async main(client: Client<true>): Promise<void> {
    console.log("🟢 estou vivo!");
  }
}