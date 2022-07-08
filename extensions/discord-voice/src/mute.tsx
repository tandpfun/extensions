import { Toast } from "@raycast/api";
import { API } from "./lib/api";

export default async function ToggleMute() {
  const toast = new Toast({ title: "Connecting to Discord..", style: Toast.Style.Animated });
  await toast.show();

  const api = new API();
  const client = await api.connect(toast);

  if (!client) return;

  const { mute, automaticGainControl, echoCancellation, noiseSuppression, silenceWarning, qos, deaf } =
    await client.getVoiceSettings();
  await client.setVoiceSettings({
    mute: !mute && deaf ? false : !mute,
    deaf: !mute && deaf ? false : deaf,
    automaticGainControl,
    echoCancellation,
    noiseSuppression,
    qos,
    silenceWarning,
  });

  client.destroy();

  toast.title = `${(!mute && deaf ? false : !mute) ? "Muted" : "Unmuted"} Microphone`;
  toast.style = (!mute && deaf ? false : !mute) ? Toast.Style.Failure : Toast.Style.Success;
}
