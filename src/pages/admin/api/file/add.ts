// @ts-ignore
import {ApiActionResponseType} from "~/models";
import type {APIRoute} from "astro";

export const POST: APIRoute = async ({request}) => {

  const apiResponse: ApiActionResponseType = {success: true};

  const api = import.meta.env.API_PATH;
  const data = await request.formData();
 
  const method = `${api}/upload`;
  const response = await fetch(method, {
    method: "POST",
    body: data,
  });

  if (response.ok) {
    return new Response(JSON.stringify(apiResponse), {status: 200});
  }

  apiResponse.success = false;
  return new Response(JSON.stringify(apiResponse), {status: 200});
};
