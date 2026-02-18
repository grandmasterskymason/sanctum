import http from "http"

export function fetchAccountAPI(
  path: string,
  authHeaders: Record<string, string>,
  options: { method?: string; body?: string } = {}
): Promise<any> {
  return new Promise((resolve, reject) => {
    const reqOptions: http.RequestOptions = {
      hostname: "account-api",
      port: 5001,
      path: path,
      method: options.method || "GET",
      headers: {
        "Accept": "application/json",
        ...authHeaders,
      },
    }

    if (options.body) {
      reqOptions.headers = {
        ...reqOptions.headers,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(options.body).toString(),
      }
    }

    const req = http.request(reqOptions, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data))
          } catch {
            resolve({})
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`))
        }
      })
    })

    req.on("error", reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}
