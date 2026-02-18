export interface FileNode {
  id: number
  name: string
  type: "file" | "folder"
  mime?: string
  size?: number
  modified: number
  path?: string
}

export interface FolderListing {
  folder: string
  files: FileNode[]
}

export function formatFileSize(bytes: number | undefined): string {
  if (!bytes || bytes === 0) return ""
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
