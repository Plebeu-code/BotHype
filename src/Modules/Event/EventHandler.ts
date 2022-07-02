import { readdirSync } from 'fs';
import { resolve } from 'path';
import { IEventProvider } from 'src/Providers/Events/IEventProvider';
import type { IEventHandler } from "./IEventHandler";
import type { TEvents } from "./TEventHandler";

class EventHandler implements IEventHandler {
  getEvents(path: string): TEvents[] {

    const eventFilesPath: TEvents[] = [] 

    const filesInDir = readdirSync(resolve(path))

    filesInDir
      .forEach(
        fileName => {
          const fileIsFolder = !/\.(ts)|(js)$/.test(fileName)

          if (fileIsFolder) {
            const eventFile = 
              readdirSync(resolve(`${path}/${fileName}`))[0]

            if (eventFile) {
              const importedEvent = 
                require(
                  resolve(`${path}/${fileName}/${eventFile}`)
                ).default

              const { eventName }: IEventProvider<any> = new importedEvent()

              eventFilesPath.push({
                eventName,
                eventHandler: importedEvent
              })
            }
          }
        }
      );

    return eventFilesPath
  }
}

export default new EventHandler()