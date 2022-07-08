import { useState, useEffect } from "react";
import { APIPartialGuild, APIUser, GuildFeature, RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { Action, ActionPanel, Icon, Image, List, Toast } from "@raycast/api";
import { API } from "./lib/api";

export default function ServerCounter() {
  const [guildsList, setGuildsList] = useState<RESTAPIPartialCurrentUserGuild[]>([]);

  useEffect(() => {
    if (!guildsList.length) getData();
  }, []);

  async function getData() {
    const api = new API();
    await api.connectOauth();

    const guilds = await api.getGuilds();
    setGuildsList(guilds);
  }

  const title = !guildsList.length ? "Fetching guilds" : undefined;
  const serverCount = guildsList;
  const ownedCount = guildsList.filter((g) => g.owner);
  const modCount = guildsList.filter((g) => BigInt(g.permissions) & BigInt(1 << 13) && !g.owner);
  const verifiedCount = guildsList.filter((g) => g.features.includes(GuildFeature.Verified));
  const partneredCount = guildsList.filter((g) => g.features.includes(GuildFeature.Partnered));
  const communityCount = guildsList.filter((g) => g.features.includes(GuildFeature.Community));
  const discoveryCount = guildsList.filter((g) => g.features.includes(GuildFeature.Discoverable));
  return (
    <List searchBarPlaceholder={title} isLoading={!guildsList.length}>
      <List.Item
        title="Server Count"
        icon="discord-nobg.png"
        accessories={[{ text: serverCount.length ? `${serverCount.length}` : "?" }]}
        actions={<CountActionPanel guilds={serverCount} />}
      />
      <List.Item
        title="Servers Owned"
        icon="owner.png"
        accessories={[{ text: ownedCount.length ? `${ownedCount.length}` : "?" }]}
        actions={<CountActionPanel guilds={ownedCount} />}
      />
      <List.Item
        title="Servers Moderated"
        icon="modbadge.png"
        accessories={[{ text: modCount.length ? `${modCount.length}` : "?" }]}
        actions={<CountActionPanel guilds={modCount} />}
      />
      <List.Item
        title="Verified"
        icon="verified.png"
        accessories={[{ text: verifiedCount.length ? `${verifiedCount.length}` : "?" }]}
        actions={<CountActionPanel guilds={verifiedCount} />}
      />
      <List.Item
        title="Partnered"
        icon="partner.png"
        accessories={[{ text: partneredCount.length ? `${partneredCount.length}` : "?" }]}
        actions={<CountActionPanel guilds={partneredCount} />}
      />
      <List.Item
        title="Community Enabled"
        icon="community.png"
        accessories={[{ text: communityCount.length ? `${communityCount.length}` : "?" }]}
        actions={<CountActionPanel guilds={communityCount} />}
      />
      <List.Item
        title="Discovery Enabled"
        icon="discovery.png"
        accessories={[{ text: discoveryCount.length ? `${discoveryCount.length}` : "?" }]}
        actions={<CountActionPanel guilds={discoveryCount} />}
      />
    </List>
  );
}

export function CountActionPanel({ guilds }: { guilds: RESTAPIPartialCurrentUserGuild[] }) {
  return (
    <ActionPanel>
      <Action.Push title="View Servers" icon={Icon.ArrowRight} target={<GuildsList guilds={guilds} />} />
      <Action.CopyToClipboard title="Copy Count" content={guilds.length} />
    </ActionPanel>
  );
}

export function GuildsList({ guilds }: { guilds: RESTAPIPartialCurrentUserGuild[] }) {
  return (
    <List>
      {guilds.map((guild) => (
        <GuildsListItem guild={guild} key={guild.id} />
      ))}
    </List>
  );
}

export function GuildsListItem({ guild }: { guild: RESTAPIPartialCurrentUserGuild }) {
  const icon: Image.ImageLike = {
    source: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=256` : "",
    mask: Image.Mask.RoundedRectangle,
  };

  return <List.Item title={guild.name} subtitle={guild.id} icon={icon} actions={<GuildsActionPanel guild={guild} />} />;
}

export function GuildsActionPanel({ guild }: { guild: RESTAPIPartialCurrentUserGuild }) {
  async function goToGuild(guild: RESTAPIPartialCurrentUserGuild) {
    const toast = new Toast({ title: "Connecting to Discord..", style: Toast.Style.Animated });
    await toast.show();

    const api = new API();
    const client = await api.connect(toast);

    if (!client) return;

    const guildChannels = await client.getChannels(guild.id);
    if (!guildChannels) {
      toast.title = "Can't find guild";
      toast.message = "Couldn't find the guild in your app's server list";
      toast.style = Toast.Style.Failure;
      return;
    }

    const channel = guildChannels.filter((c) => c.type == 0)[0];
    if (!channel) {
      toast.title = "No channels";
      toast.message = "There's no channels to navigate to";
      toast.style = Toast.Style.Failure;
      return;
    }

    await client.selectTextChannel(channel.id).catch((err) => null);
    toast.title = "Navigated to " + guild.name;
    toast.message = "Check your Discord app";
    toast.style = Toast.Style.Success;

    client.destroy();
  }

  return (
    <ActionPanel title={guild.name}>
      <Action title="Go To Server" icon={Icon.ArrowRight} onAction={() => goToGuild(guild)} />
      <Action.CopyToClipboard title="Copy Server ID" content={guild.id} />
    </ActionPanel>
  );
}
