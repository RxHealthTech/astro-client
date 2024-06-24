import {Auth, type AuthConfig} from '@auth/core'
import type {AuthAction, ResponseInternal, Session} from '@auth/core/types'
import type {APIContext} from 'astro'
import {parseString} from 'set-cookie-parser'
import Auth0 from "@auth/core/providers/auth0";
import {getToken} from "@auth/core/jwt";

export type AuthConfiguration = AuthConfig & { prefix: string }

// @ts-ignore
const authConfig = <AuthConfiguration>{
  providers: [
    Auth0({
      clientId: import.meta.env.AUTH0_CLIENT_ID,
      clientSecret: import.meta.env.AUTH0_CLIENT_SECRET,
      issuer: import.meta.env.AUTH0_DOMAIN,
    })
  ],
  callbacks:{
    async session({session, token}){
      (session as any).token = token;
      return session;
    },
    async jwt({token}){
      return token;
    }
  },
  trustHost: true,
  prefix: '/api/auth',
}

const actions: AuthAction[] = [
  'providers',
  'session',
  'csrf',
  'signin',
  'signout',
  'callback',
  'verify-request',
  'error',
]

function AstroAuthHandler(prefix: string, options: AuthConfiguration = authConfig) {
  return async ({ cookies, request }: APIContext) => {
    const url = new URL(request.url)
    console.log('url',request.url);
    const action = url.pathname.slice(prefix.length + 1).split('/')[0] as AuthAction

    if (!actions.includes(action) || !url.pathname.startsWith(prefix + '/')) return

    const res = await Auth(request, options)
    if (['callback', 'signin', 'signout'].includes(action)) {
      // Properly handle multiple Set-Cookie headers (they can't be concatenated in one)
      (res.headers as Headers).getSetCookie().forEach((cookie) => {
        const { name, value, ...options } = parseString(cookie)
        cookies.set(name, value, options as Parameters<(typeof cookies)['set']>[2])
      });
      (res.headers as Headers).delete('Set-Cookie')
    }
    return res
  }
}

/**
 * Creates a set of Astro endpoints for authentication.
 *
 * @example
 * ```ts
 * export const { GET, POST } = AstroAuth({
 *   providers: [
 *     GitHub({
 *       clientId: process.env.GITHUB_ID!,
 *       clientSecret: process.env.GITHUB_SECRET!,
 *     }),
 *   ],
 *   debug: false,
 * })
 * ```
 * @returns An object with `GET` and `POST` methods that can be exported in an Astro endpoint.
 * @param options
 */
export function AstroAuth(options = authConfig) {
  // @ts-ignore
  const { AUTH_SECRET, AUTH_TRUST_HOST, VERCEL, NODE_ENV } = import.meta.env

  options.secret ??= AUTH_SECRET
  options.trustHost ??= !!(AUTH_TRUST_HOST ?? VERCEL ?? NODE_ENV !== 'production')

  const { prefix = '/api/auth', ...authOptions } = options

  const handler = AstroAuthHandler(prefix, (authOptions as any))
  return {
    async GET(context: APIContext) {
      return await handler(context)
    },
    async POST(context: APIContext) {
      return await handler(context)
    },
  }
}

/**
 * Fetches the current session.
 * @param req The request object.
 * @param options
 * @returns The current session, or `null` if there is no session.
 */
export async function getSession(req: Request, options= authConfig): Promise<Session | null> {
  // @ts-ignore
  options.secret ??= import.meta.env.AUTH_SECRET
  options.trustHost ??= true

  const url = new URL(`${options.prefix}/session`, req.url)
  const response: ResponseInternal<Response> = await Auth(new Request(url, { headers: req.headers }), options)
  const { status = 200 } = response

  const data = await (response as any).json()

  if (!data || !Object.keys(data).length) return null
  if (status === 200) return data
  throw new Error(data.message)
}

export async function getJwt(req: Request, options = authConfig): Promise<string | null> {
// @ts-ignore
  options.secret ??= import.meta.env.AUTH_SECRET
  options.trustHost ??= true

  const url = new URL(`${options.prefix}/session`, req.url)
  const response: ResponseInternal<Response> = await Auth(new Request(url, { headers: req.headers }), options)

  const cookieName = getCookieName(response, 'session-token');
  if (!cookieName) {
    return null;
  }
  // @ts-ignore
  return await getToken({
    req,
    cookieName: cookieName,
    secret: (options.secret as string),
    raw: true,
  });


}

export function getCookieName(response: ResponseInternal<Response>, key: string): string | null {
  if (response.headers) {

    const cookies = (response.headers as Headers).getSetCookie().map(cookie => {
      const {name} = parseString(cookie)
      return name
    })
    const found = cookies.find(g => g.endsWith(key))
    return found ?? null
  }
  return null

}
