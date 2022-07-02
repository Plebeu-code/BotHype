import type { SlashCommandBuilder } from "@discordjs/builders"

export type TCommand = {
  commandSchema: SlashCommandBuilder,
  commandHandler: any
}