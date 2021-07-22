import { Message } from "discord.js";

interface MessageContain {
  contain: Array<string>;
  fn: (message: Message, match: string) => any;
}
interface MessageContains extends Array<MessageContain> {}

export const messageContains: MessageContains = [
  {
    contain: ["cookie"],
    fn: (message: Message, match: string) => {
      message.channel.send("Someone say cookie? here's some cookie :cookie:");
    }
  }
];
