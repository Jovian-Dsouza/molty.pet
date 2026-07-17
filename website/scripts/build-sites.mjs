import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const projectRoot = process.cwd()
const nextRoot = join(projectRoot, '.next')
const distRoot = join(projectRoot, 'dist')
const clientRoot = join(distRoot, 'client')
const serverRoot = join(distRoot, 'server')

await rm(distRoot, { recursive: true, force: true })
await mkdir(join(clientRoot, '_next'), { recursive: true })
await mkdir(serverRoot, { recursive: true })

await cp(join(projectRoot, 'public'), clientRoot, { recursive: true })
await cp(join(nextRoot, 'static'), join(clientRoot, '_next', 'static'), {
  recursive: true,
})
await cp(join(nextRoot, 'server', 'app', 'index.html'), join(clientRoot, 'index.html'))
await cp(
  join(nextRoot, 'server', 'app', '_not-found.html'),
  join(clientRoot, '404.html'),
)

const worker = `const worker = {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return new Response("Static asset binding unavailable", { status: 500 });
    }

    const url = new URL(request.url);
    if (url.pathname === "/") {
      url.pathname = "/index.html";
    }

    const response = await env.ASSETS.fetch(new Request(url, request));
    if (response.status !== 404) {
      return response;
    }

    const fallbackUrl = new URL("/404.html", request.url);
    return env.ASSETS.fetch(new Request(fallbackUrl, request));
  },
};

export default worker;
`

await writeFile(join(serverRoot, 'index.js'), worker)

console.log('Prepared Cloudflare-compatible static output in dist/')
