import axios, { AxiosResponse } from "axios";

import { ClientConfig, APIResponse, ClientResponse } from "../types";
import { delay } from "@src/utils";

const API_VERSION = "v2";

export class AuthNClient {
  config: ClientConfig;

  constructor(config: ClientConfig, useJwt: boolean = false) {
    if (!config.clientToken) throw new Error("A token is required");
    if (!config.domain) throw new Error("A domain is required");

    if (!config.callbackUri && typeof window !== "undefined") {
      config.callbackUri = window.location.origin;
    }

    this.config = {
      ...config,
    };
  }

  /*
    General AuthN functions
  */

  async logout(userToken: string): Promise<ClientResponse> {
    const path = "client/session/logout";
    const data = { token: userToken };

    return await this.post(path, data);
  }

  async validate(userToken: string): Promise<ClientResponse> {
    const path = "client/token/check";
    const payload = { token: userToken };

    return await this.post(path, payload);
  }

  async userinfo(code: string): Promise<ClientResponse> {
    const path = "client/userinfo";
    const payload = { code: code };

    return await this.post(path, payload);
  }

  async refresh(
    userToken: string,
    refreshToken: string
  ): Promise<ClientResponse> {
    const path = "client/session/refresh";
    const payload = { user_token: userToken, refresh_token: refreshToken };
    return await this.post(path, payload);
  }

  async jwks(): Promise<ClientResponse> {
    const path = "client/jwks";
    return await this.post(path, {});
  }

  /*
    API Request functions
  */
  async post(endpoint: string, payload: any): Promise<ClientResponse> {
    try {
      let response: AxiosResponse = await axios.post(
        this.getUrl(endpoint),
        payload,
        this.getOptions()
      );

      if (response.status === 202) {
        response = await this.handleAsync(response);
      }

      const success = response.data?.status === "Success";

      return { success, response: response.data };
    } catch (err) {
      return { success: false, response: this.getError(err) };
    }
  }

  // get request used only for async requests
  async get(endpoint: string): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await axios.get(
        this.getUrl(endpoint),
        this.getOptions()
      );

      return response;
    } catch (err) {
      throw err;
    }
  }

  async handleAsync(response: AxiosResponse): Promise<AxiosResponse> {
    const endpoint = `request/${response.data?.request_id}`;
    const maxRetries = 3;
    let retryCount = 1;

    while (response.status === 202 && retryCount <= maxRetries) {
      retryCount += 1;
      const waitTime = retryCount * retryCount * 1000;

      // eslint-disable-next-line no-await-in-loop
      await delay(waitTime);
      response = await this.get(endpoint);
    }

    return response;
  }

  getUrl(endpoint: string): string {
    const protocol = this.config.domain.match(/^local\.?host(:\d{2,5})?$/)
      ? "http"
      : "https";
    return `${protocol}://authn.${this.config.domain}/${API_VERSION}/${endpoint}`;
  }

  getOptions(): any {
    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.clientToken}`,
      },
    };

    return options;
  }

  getError(error: any): APIResponse {
    const message = {
      status: "Error",
      summary: "",
      result: {},
    };

    if (axios.isAxiosError(error) && error.response) {
      message.status = error.response.data.status;
      message.summary = error.response.data.summary;
      message.result = error.response.data.result;
    } else if (error.request) {
      message.summary = `${error.request.status} ${error.request.statusText}`;
      message.result = error.reqest;
    } else {
      message.summary = "Unhandled error";
      message.result = error;
      console.log("Unhandled error", error);
    }

    return message;
  }
}

export default AuthNClient;
