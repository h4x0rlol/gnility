import axios, { AxiosRequestConfig } from "axios";
export async function makeRequest() {
  const config: AxiosRequestConfig = {
    method: "get",
    url:
      "https://en.wikipedia.org/w/api.php?origin=*&action=query&list=random&format=json&rnnamespace=0&rnlimit=1",
  };
  let res = await axios(config);
  if (res) {
    return res.data.query.random[0].title;
  }
}
