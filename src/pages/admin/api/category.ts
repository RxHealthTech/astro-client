import type {APIRoute} from "astro";

export const GET: APIRoute = ({ params, request }) => {
  return new Response(JSON.stringify({
      message: "This was a GET!"
    })
  )
}
//
// export const POST: APIRoute = ({ request }) => {
//   return new Response(JSON.stringify({
//       message: "This was a POST!"
//     })
//   )
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DELETE: APIRoute = ({ params, request }) => {
  const id = params.id;
  
  return new Response(JSON.stringify({
      message: "This was a DELETE!"
    })
  )
}
