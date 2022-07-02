import type { SlashCommandBuilder } from "@discordjs/builders"
import type { CacheType, CommandInteraction } from "discord.js"

export interface ICommandProvider {
  readonly commandSchema: SlashCommandBuilder
  main(interaction: CommandInteraction<CacheType>): Promise<void>
}