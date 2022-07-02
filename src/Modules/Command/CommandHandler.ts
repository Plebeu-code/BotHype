import { readdirSync } from 'fs';
import { resolve } from 'path';
import type { TCommand } from './TCommandHandler';
import type { ICommandHandler } from './ICommandHandler';

class CommandHandler implements ICommandHandler {
  getCommands(path: string): TCommand[] {

    const commandResults: TCommand[] = []

    const commandFiles = readdirSync(resolve(path))

    commandFiles
      .forEach((fileName) => {
        const fileIsFolder = !/\.(ts)|(js)/.test(fileName)

        if (fileIsFolder) {
          
          const commandFile = readdirSync(resolve(`${path}/${fileName}`))[0]

          const importedCommand = require(resolve(`${path}/${fileName}/${commandFile}`)).default
          
          const { commandSchema }: TCommand = new importedCommand()

          commandResults.push({
            commandSchema,
            commandHandler: importedCommand
          })
        }
      }
    )

    return commandResults
  }
}

export default new CommandHandler()