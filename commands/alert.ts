import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, MessageFlags } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export class SlashCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Notfify the Protection Unit about a crime.',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addAttachmentOption((option) => 
            option
            .setName('proof')
            .setDescription('Images of the crime happening')
            .setRequired(false)
        )
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const img = interaction.options.getAttachment('proof', false);
    const modal = new ModalBuilder({
      customId: `reportCrime-${interaction.user.id}-${interaction.createdAt}`,
      title: "New Incident Report"
    })
    const whereInput = new TextInputBuilder({
      customId: 'where',
      label: 'Provide the location of the crime',
      min_length: 3,
      style: TextInputStyle.Short
    })
    const perpetratorsInput = new TextInputBuilder({
      customId: 'whotfdidit',
      label: 'Give the name of the perpetrator(s)',
      min_length: 3,
      style: TextInputStyle.Short,
      required: false
    })
    const describeWhatTfHappenedInput = new TextInputBuilder({
      customId: 'describewtfhappened',
      label: 'Describe what is currently going on',
      style: TextInputStyle.Paragraph,
      placeholder: 'Provide essential information that can help the Protection Unit.'
    })

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(whereInput)
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(perpetratorsInput)
    const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(describeWhatTfHappenedInput)

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow)

    await interaction.showModal(modal);

    interaction.awaitModalSubmit({
      filter: (f) => f.customId === `reportCrime-${interaction.user.id}-${interaction.createdAt}`,
      time: 120000
    }).then(async (modalInteraction) => {
      const whereValue = modalInteraction.fields.getTextInputValue('where')
      const whoValue = modalInteraction.fields.getTextInputValue('whotfdidit')
      const describeValue = modalInteraction.fields.getTextInputValue('describewtfhappened')

      const reportEmbed = new EmbedBuilder()
      .setTitle('New report')
      .setAuthor({
        name: modalInteraction.user.username,
        iconURL: modalInteraction.user.displayAvatarURL({ extension: 'png' })
      })
      .setTitle('New Report')
      .setColor("Green")
      .addFields(
        { name: 'Where the incident happened', value: whereValue },
        { name: 'Possible Perpetrators', value: whoValue },
        { name: 'Description of crime', value: describeValue }
      )
      .setImage(img?.proxyURL || null)
      .setFooter({
        iconURL: modalInteraction.client.user.displayAvatarURL({ extension: 'png' }),
        text: 'Templar - Keeping the Outback safe.'
      })

      const yesButton = new ButtonBuilder()
      .setLabel('Yes')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success)
      .setCustomId('report-yes')
      
      const noButton = new ButtonBuilder()
      .setLabel('No')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Secondary)
      .setCustomId('report-no')

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(yesButton, noButton)

      const reply = await modalInteraction.reply({
        content: 'Is your report correct? False reports can result in excommunication!',
        embeds: [reportEmbed],
        flags: MessageFlags.Ephemeral,
        components: [actionRow]
      })

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === interaction.user.id,
        max: 1,
        time: 20000
      })

      collector.on('collect', async (int) => {
        if (int.customId == 'report-yes') {
          const alertsChannel = interaction.guild?.channels.cache.get('1366784346375323648');
          if (alertsChannel?.isTextBased()) {
            alertsChannel.send({
              content: '<@&1363225302033236211>, A new report has been recieved.',
              embeds: [reportEmbed]
            });
          }
          return await int.reply({ content: 'Your report has been submitted and has been notified active members of the Protection Unit.', flags: MessageFlags.Ephemeral })
        } else if (int.customId === 'report-no') {
          return await int.reply({ content: 'You have canceled your report.', flags: MessageFlags.Ephemeral });
        }
      })

      collector.on('end', () => {
        yesButton.setDisabled(true);
        noButton.setDisabled(true);
      })
    })
  }
}