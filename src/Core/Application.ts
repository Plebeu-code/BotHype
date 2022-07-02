import { Client, type IntentsString } from "discord.js";

export class Application extends Client {
  constructor(intents: IntentsString[]) {
    super({ intents });
  }
}
