import { Message, MessageReplyOptions } from "discord.js";
import allMessages from "../command/allMessages";
import messageCommands from "../command/messageCommands";
import messageContains from "../command/messageContains";
import { MessageCommandFunctionCall } from "../interface/MessageCommand";
import { MessageContainFunctionCall } from "../interface/MessageContain";
import roleId from "../lib/roleId";

const commandPermissionDenyMessageReplyPayload: MessageReplyOptions = {
  embeds: [
    {
      color: 0xffffff,
      description: "You do not have permission to use this command."
    }
  ]
};

export default (message: Message) => {
  let trimmedMessage = message.content.trim();
  let trimmedLoweredMessage = trimmedMessage.toLowerCase();

  allMessages(message);

  // Message is sent to guild
  if (message.member) {
    let messageCommandTriggered = false;
    let messageAuthorIsStaff = false;
    let messageAuthorIsAdmin = false;

    // Check message author role level
    message.member.roles.cache.map((role) => {
      if (roleId.staffRoleIds.includes(role.id)) messageAuthorIsStaff = true;
      if (roleId.adminRoleIds.includes(role.id)) messageAuthorIsAdmin = true;
    });

    // Handle message commands
    // Set `commandLoop` label so we can break out of a nested loop with `break commandLoop`
    commandLoop: for (let i = 0; i < messageCommands.length; i++) {
      let messageCommand = messageCommands[i];

      if (!message.author.bot || messageCommand.allowBot) {
        for (let j = 0; j < messageCommand.command.length; j++) {
          let command = messageCommand.command[j].trim();
          let compareMessage = messageCommand.ignoreCase
            ? trimmedMessage.toLowerCase()
            : trimmedMessage;
          let compareCommand = messageCommand.ignoreCase ? command.toLowerCase() : command;

          if (
            compareMessage === compareCommand ||
            compareMessage.startsWith(compareCommand + " ")
          ) {
            messageCommandTriggered = true;

            if (
              !(messageCommand.isStaffCommand || messageCommand.isAdminCommand) ||
              (messageCommand.isStaffCommand && (messageAuthorIsAdmin || messageAuthorIsStaff)) ||
              (messageCommand.isAdminCommand && messageAuthorIsAdmin)
            ) {
              let commandArgs = trimmedMessage
                .substring(command.length)
                .trimStart()
                .split(" ")
                .filter((arg) => arg);

              let messageCommandFunctionCall: MessageCommandFunctionCall = {
                message,
                args: commandArgs,
                matchedCommand: command,
                fromBot: message.author.bot,
                isStaff: messageAuthorIsStaff,
                isAdmin: messageAuthorIsAdmin
              };

              messageCommand.fn(messageCommandFunctionCall);

              break commandLoop;
            } else {
              message.reply(commandPermissionDenyMessageReplyPayload);
            }
          }
        }
      }
    }

    // Handle message contains
    if (!messageCommandTriggered) {
      let messageLowerNoEmoji = trimmedLoweredMessage.replace(/:[^:\s]*(?:::[^:\s]*)*:/g, ""); // https://stackoverflow.com/a/49783944

      for (let i = 0; i < messageContains.length; i++) {
        let messageContain = messageContains[i];
        let containFunction = null;
        let containString = null;

        if (!message.author.bot || messageContain.allowBot) {
          for (let j = 0; j < messageContain.contain.length; j++) {
            containString = messageContain.contain[j];

            if (messageLowerNoEmoji.includes(containString.toLowerCase())) {
              if (
                !(messageContain.isStaffContain || messageContain.isAdminContain) ||
                (messageContain.isStaffContain && (messageAuthorIsAdmin || messageAuthorIsStaff)) ||
                (messageContain.isAdminContain && messageAuthorIsStaff)
              ) {
                containFunction = messageContain.fn;

                break;
              }
            }
          }

          if (containString && containFunction) {
            let messageContailFunctionCall: MessageContainFunctionCall = {
              message,
              matchedContain: containString,
              fromBot: message.author.bot,
              isStaff: messageAuthorIsStaff,
              isAdmin: messageAuthorIsAdmin
            };

            containFunction(messageContailFunctionCall);
          }
        }
      }
    }
  }
};
