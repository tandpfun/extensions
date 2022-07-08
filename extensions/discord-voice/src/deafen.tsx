import { Toast } from "@raycast/api";
import { API } from "./lib/api";

export default async function ToggleDeafen() {
  const toast = new Toast({ title: "Connecting to Discord..", style: Toast.Style.Animated });
  await toast.show();

  const api = new API();
  const client = await api.connect(toast);

  if (!client) return;

  const { mute, automaticGainControl, echoCancellation, noiseSuppression, silenceWarning, qos, deaf } =
    await client.getVoiceSettings();
  await client.setVoiceSettings({
    mute: !deaf || mute,
    deaf: !deaf,
    automaticGainControl,
    echoCancellation,
    noiseSuppression,
    qos,
    silenceWarning,
  });

  client.destroy();

  toast.title = `${deaf ? "Undeafened" : "Deafened"} Speakers`;
  toast.style = deaf ? Toast.Style.Success : Toast.Style.Failure;
}
