import { Toast } from "@raycast/api";
import { APIUser } from "discord-api-types/v10";
import { Client } from "discord-rpc";
import fetch from "node-fetch";
import { apiURL, authorize, clientId, scopes, getOAuthTokens, resetOAuthTokens } from "./oauth";

export type APIError = { message: string; code: number };

export class API {
  client: Client;
  accessToken: string;
  clientId: string;
  apiURL: string;

  constructor() {
    this.client = new Client({ transport: "ipc" });
    this.clientId = clientId;
    this.apiURL = apiURL;
    this.accessToken = "";

    this.client.on("disconnected", () => {
      console.log("disconnected");
      this.client.destroy();
    });
  }

  async connect(toast?: Toast) {
    await this.connectOauth();

    return await this.client
      .login({ accessToken: this.accessToken, clientId: this.clientId, scopes })
      .catch(async (err) => {
        if (err.code == 4009) {
          await resetOAuthTokens();
          if (toast) {
            toast.title = `Logged Out`;
            toast.message = `Try running the command again.`;
            toast.style = Toast.Style.Failure;
          }
          return;
        }

        if (toast) {
          if (process.env.TMPDIR) {
            toast.title = `Connection Failed`;
            toast.message = `Is Discord running?`;
            toast.style = Toast.Style.Failure;
          } else {
            toast.title = `Update Raycast`;
            toast.message = `Run "Check for Updates" command.`;
            toast.style = Toast.Style.Failure;
          }
        }
        return;
      });
  }

  async connectOauth() {
    await authorize();
    const tokens = await getOAuthTokens();
    return (this.accessToken = tokens?.accessToken || "");
  }

  async getUser() {
    return fetch(this.apiURL + "/users/@me", { headers: { Authorization: `Bearer ${this.accessToken}` } }).then((r) =>
      r.json()
    ) as Promise<APIUser>;
  }
}
