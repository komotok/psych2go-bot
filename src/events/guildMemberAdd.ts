import { GuildMember } from "discord.js";

export function handleGuildMemberAddEvent(member: GuildMember) {
  // Code runs when a member is added to the guild (server)
  // member.guild.systemChannel?.send(`Welcome <@${member.id}> to the server!`);
}
