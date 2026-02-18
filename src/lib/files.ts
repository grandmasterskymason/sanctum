import { headers } from "next/headers"
import { fetchFromNextcloud } from "./api"

export type { FileNode, FolderListing } from "./files-shared"
export { formatFileSize } from "./files-shared"

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  const groups = headersList.get("x-authentik-groups")
  const name = headersList.get("x-authentik-name")

  if (!username) {
    throw new Error("Unauthorized")
  }

  return {
    "X-Authentik-Username": username,
    "X-Authentik-Groups": groups || "",
    "X-Authentik-Name": name || "",
  }
}

export async function getFiles(folderId: number) {
  try {
    const authHeaders = await getAuthHeaders()
    return await fetchFromNextcloud(
      `/apps/skymasonsnav/api/files/${folderId}`,
      { headers: authHeaders }
    )
  } catch (error) {
    console.error("Failed to fetch files:", error)
    return null
  }
}

export function getFileIcon(mime: string | undefined, type: string): string {
  if (type === "folder") return "📁"
  if (!mime) return "📄"
  if (mime.startsWith("image/")) return "🖼️"
  if (mime.startsWith("video/")) return "🎬"
  if (mime.startsWith("audio/")) return "🎵"
  if (mime === "application/pdf") return "📕"
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "📊"
  if (mime.includes("document") || mime.includes("word")) return "📝"
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "📽️"
  if (mime.includes("text/")) return "📄"
  return "📄"
}
