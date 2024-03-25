import type {APIRoute} from "astro";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DELETE: APIRoute = async ({ params, request }) => {
  const id = params.id;

  const api = import.meta.env.API_PATH;
  const url = new URL(`${api}/report/nutrition/${id}`);
  const response = await fetch(url, {
    method: "DELETE"
  });

  if(!response.ok) {
    return new Response(JSON.stringify({
      message: "There was an error!"
    }), {
      status: response.status,
      statusText: response.statusText
    });
  }

  return new Response(JSON.stringify({
      message: "This was a DELETE!"
    })
  )
}
