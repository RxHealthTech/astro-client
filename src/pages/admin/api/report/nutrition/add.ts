import type {APIRoute} from "astro";
import type { ApiActionResponseType} from '~/models'

export const POST: APIRoute = async ({request}) => {

  const apiResponse: ApiActionResponseType = {success: true};

  const api = import.meta.env.API_PATH;
  const data = await request.json();
  const body = JSON.stringify(data)
  
  const method = `${api}/report/nutrition`;
  const response = await fetch(method, {
   method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })

  if (response.ok) {
    return new Response(JSON.stringify(apiResponse), {status: 200});
  }

  apiResponse.success = false;
  return new Response(JSON.stringify(apiResponse), {status: 200});
}
