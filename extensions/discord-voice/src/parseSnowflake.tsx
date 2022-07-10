import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { useState } from "react";

export const snowflakeRegex = /\b\d{17,19}\b/g;

export function parseSnowflake(snowflake: string) {
  if (!snowflakeRegex.test(snowflake)) return;
  return DiscordSnowflake.deconstruct(snowflake);
}

export default function ParseSnowflakeList() {
  const [snowflake, setSnowflake] = useState("");

  const parsedSnowflake = parseSnowflake(snowflake);
  const timestamp = Number(parsedSnowflake?.timestamp);
  const seconds = Math.round(timestamp / 1000);
  const workerId = parsedSnowflake?.workerId;
  const processId = parsedSnowflake?.processId;
  const increment = parsedSnowflake?.increment;

  return (
    <List searchBarPlaceholder="Enter snowflake" onSearchTextChange={setSnowflake}>
      <SnowflakeListItem
        title="Date Created:"
        subtitle={seconds ? new Date(seconds * 1000).toLocaleString() : "Invalid Snowflake"}
        icon={Icon.Calendar}
      />
      <SnowflakeListItem
        title="Milliseconds Timestamp:"
        subtitle={seconds ? `${timestamp}` : "Invalid Snowflake"}
        icon={Icon.Clock}
      />
      <SnowflakeListItem
        title="Seconds Timestamp:"
        subtitle={seconds ? `${seconds}` : "Invalid Snowflake"}
        icon={Icon.Clock}
      />
      <SnowflakeListItem
        title="Worker:"
        subtitle={workerId != null ? `${workerId}` : "Invalid Snowflake"}
        icon={Icon.Hammer}
      />
      <SnowflakeListItem
        title="Process:"
        subtitle={processId != null ? `${processId}` : "Invalid Snowflake"}
        icon={Icon.MemoryChip}
      />
      <SnowflakeListItem
        title="Increment:"
        subtitle={increment != null ? `${increment}` : "Invalid Snowflake"}
        icon={Icon.Plus}
      />
    </List>
  );
}

export function SnowflakeListItem({ ...props }: List.Item.Props) {
  return (
    <List.Item
      actions={<CopyValueAction value={typeof props.subtitle === "string" ? props.subtitle : ""} />}
      {...props}
    />
  );
}

export function CopyValueAction({ value }: { value: string }) {
  return (
    <ActionPanel>
      <Action.CopyToClipboard title="Copy Value" content={value} />
    </ActionPanel>
  );
}
