export interface Toast {
  key: number
  title: string
  body: string
  tag?: string
  collapsedCount?: number
}

let nextKey = 1
let achievementTimer: ReturnType<typeof setTimeout> | null = null
const toastTimers = new Map<number, ReturnType<typeof setTimeout>>()
let achievementPopupsEnabled = true
let routineToastsEnabled = true
export const MAX_VISIBLE_TOASTS = 1

export const toastState = $state<{ list: Toast[]; queue: Toast[]; achievements: Toast[] }>({
  list: [],
  queue: [],
  achievements: [],
})

function showToast(toast: Toast) {
  toastState.list.push(toast)
  const timer = setTimeout(() => {
    toastTimers.delete(toast.key)
    toastState.list = toastState.list.filter((entry) => entry.key !== toast.key)
    promoteQueuedToasts()
  }, 4_500)
  toastTimers.set(toast.key, timer)
}

function promoteQueuedToasts() {
  while (toastState.list.length < MAX_VISIBLE_TOASTS && toastState.queue.length > 0) {
    const next = toastState.queue.shift()
    if (next) showToast(next)
  }
}

export function pushToast(title: string, body: string, tag?: string) {
  if (!routineToastsEnabled) return
  const toast = { key: nextKey++, title, body, tag }
  if (toastState.list.length < MAX_VISIBLE_TOASTS) showToast(toast)
  else toastState.queue.push(toast)
}

function scheduleAchievementAdvance() {
  if (achievementTimer !== null || toastState.achievements.length === 0) return
  achievementTimer = setTimeout(() => {
    toastState.achievements.shift()
    achievementTimer = null
    scheduleAchievementAdvance()
  }, 5_000)
}

/** Achievement notices use one calm top-edge ribbon and queue instead of stacking. */
export function pushAchievementToast(title: string, body: string, tag?: string) {
  if (!achievementPopupsEnabled) return
  const summary = toastState.achievements.find((toast) => toast.collapsedCount !== undefined)
  if (summary) {
    summary.collapsedCount = (summary.collapsedCount ?? 0) + 1
    summary.title = `${summary.collapsedCount} more achievements unlocked`
  } else if (toastState.achievements.length >= 2) {
    toastState.achievements.push({
      key: nextKey++,
      title: '1 more achievement unlocked',
      body: 'The remaining unlocks are safely recorded in Run records.',
      tag: 'achievement summary',
      collapsedCount: 1,
    })
  } else {
    toastState.achievements.push({ key: nextKey++, title, body, tag })
  }
  scheduleAchievementAdvance()
}

export function setToastPreferences(preferences: {
  achievementPopups: boolean
  routineToasts: boolean
}) {
  achievementPopupsEnabled = preferences.achievementPopups
  routineToastsEnabled = preferences.routineToasts
  if (!achievementPopupsEnabled) {
    toastState.achievements = []
    if (achievementTimer !== null) clearTimeout(achievementTimer)
    achievementTimer = null
  }
  if (!routineToastsEnabled) {
    for (const timer of toastTimers.values()) clearTimeout(timer)
    toastTimers.clear()
    toastState.list = []
    toastState.queue = []
  }
}

export function clearToasts() {
  for (const timer of toastTimers.values()) clearTimeout(timer)
  toastTimers.clear()
  toastState.list = []
  toastState.queue = []
  toastState.achievements = []
  if (achievementTimer !== null) clearTimeout(achievementTimer)
  achievementTimer = null
}
