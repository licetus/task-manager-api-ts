import url from 'url'

const routes: any = {}

export const add = (path: string) => {
  path = path.toLowerCase()
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  routes[path] = true
}

export const has = (path: string) => {
  if (routes['*']) return true
  const pathname = (url.parse(path).pathname as string).toLowerCase()
  return routes[pathname] || false
}
