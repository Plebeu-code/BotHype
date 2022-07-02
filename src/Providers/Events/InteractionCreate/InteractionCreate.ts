import { commands } from "@src";
import type { Interaction, CacheType } from "discord.js";
import type { IEventProvider } from "../IEventProvider";

export default class interactionCreateEvent implements IEventProvider<"interactionCreate"> {
  public readonly eventName: string = "interactionCreate";

  async main(interaction: Interaction<CacheType>): Promise<void> {
    if (interaction.isCommand()) {
      for (
        const { 
          commandSchema: { name: applicationCommandName },
          commandHandler 
        } of commands) {
          if (interaction.commandName === applicationCommandName) {
            console.log(`[🟢 REQUEST] > ${interaction.user.tag}: '/${applicationCommandName}'`);
            return await new commandHandler().main(interaction)
          }
      }
    }
  }
}