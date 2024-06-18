export const formatDateAsString = (date: Date): string => {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  let interval = Math.floor(seconds / 31536000)

  if (interval >= 1) {
    return `${interval}年前`
  }
  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) {
    return `${interval}ヶ月前`
  }
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return `${interval}日前`
  }
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return `${interval}時間前`
  }
  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return `${interval}分前`
  }
  return 'たった今'
}
