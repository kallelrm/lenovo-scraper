import axios from "axios";
import { IHttpClient } from "../http/http.client.interface";

export class AxiosHttpClient implements IHttpClient {
  async get(url: string): Promise<string> {
    const response = await axios.get(url);
    return response.data;
  }
}
