import { Action, ActionPanel, Icon, Image, List, Toast } from "@raycast/api";
import { API } from "./lib/api";

import { useState, useEffect } from "react";
import type { Channel, Guild } from "discord-rpc";

export default function GuildsList() {
  const [guildsList, setGuildsList] = useState<Guild[]>([]);

  useEffect(() => {
    if (!guildsList.length) getGuilds();
  }, []);

  async function getGuilds() {
    const toast = new Toast({ title: "Connecting to Discord..", style: Toast.Style.Animated });
    await toast.show();

    const api = new API();
    const client = await api.connect(toast);
    if (!client) return;

    {
      /* The types for the package are broken */
    }
    const getGuilds = (await client.getGuilds()) as unknown as { guilds: Guild[] };
    setGuildsList(getGuilds.guilds);

    await client.destroy();

    toast.hide();
  }

  return (
    <List searchBarPlaceholder="Select a server" isLoading={!guildsList.length}>
      {guildsList.map((guild) => (
        <GuildsListItem guild={guild} key={guild.id} />
      ))}
    </List>
  );
}

export function GuildsListItem({ guild }: { guild: Guild }) {
  const icon: Image.ImageLike = {
    source: guild.icon_url ?? "",
    mask: Image.Mask.RoundedRectangle,
  };

  return <List.Item title={guild.name} subtitle={guild.id} icon={icon} actions={<GuildsActionPanel guild={guild} />} />;
}

export function GuildsActionPanel({ guild }: { guild: Guild }) {
  return (
    <ActionPanel title={guild.name}>
      <Action.Push title="Select Server" icon={Icon.ArrowRight} target={<ChannelsList guild={guild} />} />
      <Action.CopyToClipboard title="Copy Server ID" content={guild.id} />
    </ActionPanel>
  );
}

export function ChannelsList({ guild }: { guild: Guild }) {
  const [channelsList, setChannelsList] = useState([] as Channel[]);

  useEffect(() => {
    if (!channelsList.length) getChannels();
  }, []);

  async function getChannels() {
    const toast = new Toast({ title: "Connecting to Discord..", style: Toast.Style.Animated });
    await toast.show();

    const api = new API();
    const client = await api.connect(toast);
    if (!client) return;

    const channels = await client.getChannels(guild.id);
    setChannelsList(channels);

    await client.destroy();

    toast.hide();
  }

  return (
    <List searchBarPlaceholder="Select a channel" isLoading={!channelsList.length}>
      {channelsList
        .filter((c) => c.type === 2)
        .map((channel) => (
          <ChannelsListItem channel={channel} key={channel.id} />
        ))}
    </List>
  );
}

export function ChannelsListItem({ channel }: { channel: Channel }) {
  return (
    <List.Item
      title={channel.name}
      subtitle={channel.id}
      icon="voice-channel.png"
      actions={<ChannelActionPanel channel={channel} />}
    />
  );
}

export function ChannelActionPanel({ channel }: { channel: Channel }) {
  return (
    <ActionPanel title={channel.name}>
      <Action title="Join Channel" icon={Icon.Plus} onAction={() => joinChannel(channel)} />
      <Action.CopyToClipboard title="Copy Channel ID" content={channel.id} />
    </ActionPanel>
  );
}

export async function joinChannel(channel: Channel) {
  const toast = new Toast({ title: "Connecting to Discord..", style: Toast.Style.Animated });
  await toast.show();

  const api = new API();
  const client = await api.connect(toast);
  if (!client) return;

  const joinChannel = await client.selectVoiceChannel(channel.id).catch(() => null);
  await client.destroy();

  if (!joinChannel) {
    toast.title = "Failed to join";
    toast.message = "Do you have permission to join?";
    toast.style = Toast.Style.Failure;
    return;
  }

  toast.title = "Joined " + channel.name;
  toast.style = Toast.Style.Success;
}
