import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {

  const api = import.meta.env.API_PATH;
  const data = await request.formData();
  const name = data.get("name");
 
  const method = `${api}/upload`;
  const response = await fetch(method, {
    method: "POST",
    body: data,
  });
  
  // Do something with the data, then return a success response
  return new Response(
    JSON.stringify({
      message: "Success!"
    }),
    { status: 200 }
  );
};
