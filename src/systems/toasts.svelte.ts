export interface Toast {
  key: number
  title: string
  body: string
  tag?: string
}

let nextKey = 1

export const toastState = $state<{ list: Toast[] }>({ list: [] })

export function pushToast(title: string, body: string, tag?: string) {
  const key = nextKey++
  toastState.list.push({ key, title, body, tag })
  if (toastState.list.length > 4) toastState.list.shift()
  setTimeout(() => {
    toastState.list = toastState.list.filter((t) => t.key !== key)
  }, 5_000)
}

export function clearToasts() {
  toastState.list = []
}
