import type { TCommand } from "./TCommandHandler";

export interface ICommandHandler {
  getCommands(path: string): TCommand[]
}