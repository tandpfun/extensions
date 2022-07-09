import { Action, ActionPanel, Color, Icon, List, ListItemProps } from "@raycast/api";
import { APIGroupDMChannel, APIGuild, APIInvite, APIInviteGuild, RESTGetAPIInviteResult } from "discord-api-types/v10";
import { useState, useEffect } from "react";
import { API } from "./lib/api";

const inviteRegex = /(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/([A-Za-z0-9-]+)/;

function parseInvite(invite: string) {
  const inviteMatch = invite.match(inviteRegex);

  let parsedInvite;
  if (!inviteMatch?.[1]) parsedInvite = invite;
  else parsedInvite = inviteMatch[1];

  console.dir(parsedInvite, { depth: null });

  if (!parsedInvite || parsedInvite.length < 2) return null;
  else return parsedInvite;
}

export default function InviteInfoList() {
  const [isLoading, setLoading] = useState(false);
  const [invite, setInvite] = useState("");
  const [inviteData, setInviteData] = useState<APIInvite>();
  const [inviteInvalid, setInviteInvalid] = useState(false);

  async function getInvite(invite: string) {
    const api = new API();
    const getInviteData = await api.getInvite(invite);
    console.log(getInviteData);
    if ("message" in getInviteData) {
      setLoading(false);
      setInviteInvalid(true);
      setInviteData(undefined);
      return;
    }

    setLoading(false);
    setInviteInvalid(false);
    setInviteData(getInviteData);
  }

  useEffect(() => {
    if (invite === "") return;

    setLoading(true);

    const parsedInvite = parseInvite(invite);
    if (!parsedInvite) {
      setLoading(false);
      setInviteInvalid(true);
      setInviteData(undefined);
      return;
    }

    getInvite(parsedInvite);
  }, [invite]);

  return (
    <List searchBarPlaceholder="Enter invite to look up" onSearchTextChange={setInvite} isLoading={isLoading} throttle>
      {inviteInvalid && (
        <InviteInfoListItem
          title="Invalid Invite"
          subtitle="The invite is either invalid or has expired."
          icon={{ source: Icon.XmarkCircle, tintColor: Color.Red }}
        />
      )}
      {inviteData && <InviteListGroup invite={inviteData} />}
    </List>
  );
}

export function InviteListGroup({ invite }: { invite: RESTGetAPIInviteResult }) {
  return (
    <>
      <InviteInfoSection invite={invite} />
      <InviteGuildSection invite={invite} />
      <InviteChannelSection invite={invite} />
      <InviteInviterSection invite={invite} />
    </>
  );
}

export function InviteInfoSection({ invite }: { invite: APIInvite }) {
  const inviteExpires = invite.expires_at ? new Date(invite.expires_at).toLocaleString() : "Never Expires";
  return (
    <List.Section title="Invite Info">
      <InviteInfoListItem
        title="Invite Type:"
        subtitle={invite.guild ? "Server Invite" : "Group DM Invite"}
        icon={{ source: Icon.MagnifyingGlass, tintColor: Color.PrimaryText }}
      />
      <InviteInfoListItem
        title="Invite Expires At:"
        subtitle={inviteExpires}
        icon={{ source: Icon.Calendar, tintColor: Color.PrimaryText }}
      />
    </List.Section>
  );
}

export function InviteGuildSection({ invite }: { invite: APIInvite }) {
  if (!invite.guild) return <></>;
  const guildDescription = invite.guild?.description || (invite.guild as APIGuild)?.welcome_screen?.description;

  return (
    <List.Section title="Server Info">
      <InviteInfoListItem
        title="Server Name:"
        subtitle={invite.guild.name}
        icon={`https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}.png?size=256`}
      />
      {guildDescription && (
        <InviteInfoListItem
          title="Description:"
          subtitle={guildDescription}
          icon={{ source: Icon.Text, tintColor: Color.PrimaryText }}
        />
      )}
      <InviteInfoListItem
        title="Server ID:"
        subtitle={invite.guild.id}
        icon={{ source: Icon.Document, tintColor: Color.PrimaryText }}
      />
      {invite.approximate_member_count && invite.approximate_presence_count && (
        <>
          <InviteInfoListItem
            title="Members Online:"
            subtitle={invite.approximate_presence_count.toLocaleString()}
            icon={{ source: Icon.Person, tintColor: Color.Green }}
          />
          <InviteInfoListItem
            title="Member Count:"
            subtitle={invite.approximate_member_count.toLocaleString()}
            icon={{ source: Icon.Person, tintColor: Color.PrimaryText }}
          />
        </>
      )}
      {invite.guild.vanity_url_code && (
        <InviteInfoListItem
          title="Vanity URL:"
          subtitle={`https://discord.gg/${invite.guild.vanity_url_code}`}
          icon={{ source: Icon.Link, tintColor: Color.PrimaryText }}
        />
      )}
      <InviteInfoListItem
        title="Features:"
        subtitle={invite.guild.features.join(", ")}
        icon={{ source: Icon.Star, tintColor: Color.PrimaryText }}
      />
    </List.Section>
  );
}

export function InviteChannelSection({ invite }: { invite: APIInvite }) {
  if (!invite.channel) return <></>;

  return (
    <List.Section title={invite.guild ? "Channel Info" : "Group DM Info"}>
      <InviteInfoListItem
        title="Channel Name:"
        subtitle={
          invite.channel.name ||
          ((invite.channel as APIGroupDMChannel).recipients?.length
            ? (invite.channel as APIGroupDMChannel).recipients?.map((r) => r.username).join(", ")
            : "Unnamed")
        }
        icon={
          (invite.channel as APIGroupDMChannel).icon
            ? `https://cdn.discordapp.com/channel-icons/${invite.channel.id}/${
                (invite.channel as APIGroupDMChannel).icon
              }.png?size=256`
            : "text-channel.png"
        }
      />
      <InviteInfoListItem
        title="Channel ID:"
        subtitle={invite.channel.id}
        icon={{ source: Icon.Document, tintColor: Color.PrimaryText }}
      />
    </List.Section>
  );
}

export function InviteInviterSection({ invite }: { invite: APIInvite }) {
  if (!invite.inviter) return <></>;
  return (
    <List.Section title={"Invite Creator"}>
      <InviteInfoListItem
        title="Creator:"
        subtitle={`${invite.inviter.username}#${invite.inviter.discriminator}`}
        icon={
          invite.inviter.avatar
            ? `https://cdn.discordapp.com/avatars/${invite.inviter.id}/${invite.inviter.avatar}.png?size=256`
            : Icon.Person
        }
      />
      <InviteInfoListItem
        title="Creator ID:"
        subtitle={invite.inviter.id}
        icon={{ source: Icon.Document, tintColor: Color.PrimaryText }}
      />
    </List.Section>
  );
}

export function InviteInfoListItem({ ...props }: List.Item.Props) {
  return (
    <List.Item
      actions={<InviteInfoListActions value={typeof props.subtitle === "string" ? props.subtitle : ""} />}
      {...props}
    />
  );
}

export function InviteInfoListActions({ value }: { value: string }) {
  return (
    <ActionPanel>
      <Action.CopyToClipboard title="Copy Value" content={value} />
    </ActionPanel>
  );
}
