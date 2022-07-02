import { SlashCommandBuilder } from "@discordjs/builders";
import RateLimit from "@Middlewares/RateLimit/RateLimit";
import { CacheType, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import type { ICommandProvider } from "../ICommandProvider";

export default class AutoChat implements ICommandProvider {
  public readonly commandSchema: 
    SlashCommandBuilder = 
      new SlashCommandBuilder()
        .setName("autochat")
        .addStringOption(option => 
          option
            .setName("choose")
            .setDescription("choose a option")
            .addChoices(
              { 
                name: "create",
                value: "create" 
              },
              { 
                name: "remove", 
                value: "remove" 
              },
              { 
                name: "list", 
                value: "list" 
              },
            )
            .setRequired(true)
        )
        .setDescription("channel handler")

  public readonly EMBEDS = {
    FIRST_FORM_EMBED: new MessageEmbed({
      title: "Onde criar o botão?",
      description: "informe o id do canal onde o botão será criado.",
      color: "#292493"
    }),
    SECOND_FORM_EMBED: new MessageEmbed(
      {
        title: "Qual será o nome do canal criado?",
        description: "Esse nome será usado em todos canais criados com esse botão.\n\nExemplo: Geral",
        color: "#292493"
      }
    ),
    INVALID_CHANNEL: new MessageEmbed(
      {
        title: "Canal não encontrado.",
        description: "Não foi possível encontrar um canal com o id informado. Certifique-se de copiar corretamente o id do canal onde o botão será criado e então use o comando novamente.",
        color: "RED"
      }
    ),
    OPS_RATELIMIT: new MessageEmbed(
      {
        title: "Ops!",
        description: "aguarde um momento e tente novamente!",
        color: "RED"
      }
    )
  }

  async main(interaction: CommandInteraction<CacheType>): Promise<void> {
    const chooseOption = interaction.options.getString("choose")

    if (chooseOption === "create") {
      return await this.createButton(interaction)
    }
  }

  async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async createButton(interaction: CommandInteraction<CacheType>) {

    const channel = interaction.channel

    const formCollector = channel.createMessageCollector({
      filter: (message) => message.author.id === interaction.user.id,
      max: 999,
      idle: 60 * 1000,
    })

    await interaction.reply({
      embeds: [this.EMBEDS.FIRST_FORM_EMBED]
    })

    const collectorRateLimit = new RateLimit(5, 5000)
    const interactionRateLimit = new RateLimit(5, 10000)

    formCollector.on("collect", async (message) => {
      if (formCollector.collected.size === 1) {

        if (interactionRateLimit.limit + 1 === interactionRateLimit.max_limit) {
          formCollector.collected.delete(formCollector.collected.lastKey())

          await interactionRateLimit.addLimit
          
          interaction.editReply({
            embeds: [this.EMBEDS.OPS_RATELIMIT]
          })
          
          return
        }
        
        await collectorRateLimit.addLimit

        await interactionRateLimit.addLimit

        interaction.editReply({
          embeds: [this.EMBEDS.FIRST_FORM_EMBED]
        })
  
        const idIsValid = message.content.length === 18 && Number(message.content)
  
        if (!idIsValid) {
          formCollector.collected.delete(formCollector.collected.lastKey())
  
          await interactionRateLimit.addLimit
          
          interaction.editReply({
            embeds: [this.EMBEDS.INVALID_CHANNEL]
          })
          
          await this.wait(3500)
  
          await interactionRateLimit.addLimit
          
          interaction.editReply({ 
            embeds: [this.EMBEDS.FIRST_FORM_EMBED]
          })
  
          return
        }
  
        const fetchResponse = message.guild.channels.fetch(message.content)
  
        if (!fetchResponse) {
          formCollector.collected.delete(formCollector.collected.lastKey())
  
          await interactionRateLimit.addLimit
          interaction.editReply({
            embeds: [this.EMBEDS.INVALID_CHANNEL]
          })
  
          await this.wait(3500)
  
          await interactionRateLimit.addLimit
  
          interaction.editReply({ 
            embeds: [this.EMBEDS.FIRST_FORM_EMBED]
          })
          return
        }
      }

      await interactionRateLimit.addLimit

      interaction.editReply({
        embeds: [this.EMBEDS.SECOND_FORM_EMBED]
      })

      if (formCollector.collected.size === 2) formCollector.stop("max")
    })

    formCollector.once("end", async (collected, reason) => {
      if (reason !== "max") {
        return interaction.deleteReply().catch(null)
      }

      const [channelId, channelName]: string[] = collected.map(({ content }) => content)

      const buttons: 
        [MessageButton, MessageButton] = [
          new MessageButton({
            label: "Criar",
            style: "SUCCESS",
            customId: "create"
          }),
          new MessageButton({
            label: "Cancelar",
            style: "DANGER",
            customId: "cancel"
          })
      ]

      const buttonRow = 
        new MessageActionRow()
          .setComponents(buttons)

      await interactionRateLimit.addLimit

      interaction.editReply({
        embeds: [
          new MessageEmbed(
            {
              title: "Criar botão?",
              description: `o botão será criado no canal <#${channelId}>`,
              color: "#292493"
            }
          )
        ],
        components: [buttonRow]
      })

      const componentCollector = 
        channel
          .createMessageComponentCollector({
            componentType: "BUTTON",
            filter: (i) => i.user.id === interaction.user.id,
            max: 1,
            idle: 60 * 1000,
          })

      componentCollector.once("end", 
        async (collected, reason) => {
          if (reason !== "max") {
            return interaction.deleteReply().catch(null)
          }

          const customId = collected.map(({ customId }) => customId)[0]

          if (customId === "cancel") {
            interaction.deleteReply().catch(null)
          }

          await interactionRateLimit.addLimit

          interaction.editReply({
            embeds: [
              new MessageEmbed(
                {
                  title: "Botão criado com sucesso!",
                  description: `o botão foi criado no canal <#${channelId}>`
                }
              )
            ]
          })
        }
      )

    })

  }

}