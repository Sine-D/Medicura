const store = new Map()

function cached(ttlMs = 600000) { // default 10 minutes
  return (req, res, next) => {
    const key = req.originalUrl
    const now = Date.now()
    const hit = store.get(key)
    if (hit && hit.expiresAt > now) {
      return res.json(hit.payload)
    }
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      try {
        store.set(key, { payload: body, expiresAt: now + ttlMs })
      } catch {}
      return originalJson(body)
    }
    next()
  }
}

export default cached
