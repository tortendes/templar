import { EmbedBuilder } from '@discordjs/builders';
import { Events, Listener, type ChatInputCommandDeniedPayload, type UserError } from '@sapphire/framework';

export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
  public run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    const embed = new EmbedBuilder()
      .setTitle('An error occured')
      .setDescription(error.message)
      .setColor(0xFF0000) // Red color in hexadecimal
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({
        content: error.message
      });
    }

    return interaction.reply({
      embeds: [embed]
    });
  }
}