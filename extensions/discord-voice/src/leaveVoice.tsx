import { Toast } from "@raycast/api";
import { API } from "./lib/api";

export default async function LeaveVoice() {
  const toast = new Toast({ title: "Connecting to Discord..", style: Toast.Style.Animated });
  await toast.show();

  const api = new API();
  const client = await api.connect(toast);

  if (!client) return;

  {
    /* The types for the package are broken */
  }
  await client.selectVoiceChannel(null as unknown as string);

  client.destroy();

  toast.title = `Disconnected from voice`;
  toast.style = Toast.Style.Success;
}
