// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";

const woocOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = Array.isArray(req["query"]["code"])
    ? req["query"]["code"][0]
    : req["query"]["code"];

  const response = await callWoocAPI(code!);
  res.status(200).json({ status: "ok", result: response });
};

export default woocOrder;

const callWoocAPI = async (code: string) => {
  const apiUrl = process.env.WOOC_API_URL + "=" + code;

  try {
    const res = await fetch(apiUrl, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        Authorization: `Basic ${process.env.WOOC_API_AUTH}`,
      },
    });

    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
    return err;
  }
};
