import '@config';

import { Routes } from "discord-api-types/v10"
import { REST } from "@discordjs/rest"

import EventHandler from '@modules/Event/EventHandler';

import { Application } from '@core';
import CommandHandler from '@modules/Command/CommandHandler';
import RateLimit from '@Middlewares/RateLimit/RateLimit';

console.time("applicationInit")

const instance = new Application(["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"])

const events = EventHandler.getEvents("./src/Providers/Events")

console.log("🟡 Registrando eventos ...");

events.forEach(
  ({ eventName, eventHandler }) =>
    instance.on(eventName, (args) => new eventHandler().main(args))
)

console.log(`🟢 '${events.length}' ${events.length > 1 ? "eventos registrados" : "evento registrado"}!`);

const commands = CommandHandler.getCommands("./src/Providers/Commands")

const { TOKEN } = process.env 

const commandRateLimit = new RateLimit(5, 10000)

instance.on("apiRequest", async (req) => {
  if (req.method === "post") {
    const { type } = req.options as any
    if (type === 4) await commandRateLimit.addLimit
  }
})

instance
  .login(TOKEN)
    .then(
      async () => {
        console.log("🟡 Procurando guildas ...");

        await instance.guilds.fetch()

        console.log("🟡 Registrando comandos ...");

        const rest = new REST({ version: "10" }).setToken(TOKEN)

        const guildId = instance.guilds.cache.first().id

        await rest.put(
          Routes.applicationGuildCommands(instance.user.id, guildId),
          { body: commands.map(({ commandSchema }) => commandSchema) }
        )

        console.log(`🟢 '${commands.length}' ${commands.length > 1 ? "comandos registrados" : "comando registrado"}!`);

        console.timeEnd("applicationInit")
      }
    )
   

export { commands, commandRateLimit }
   