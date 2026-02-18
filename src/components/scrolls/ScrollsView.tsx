"use client"

import { useState, useEffect, useCallback } from "react"
import { ChamberHeader, EmptyState, Card, CardTitle } from "@/components/shared"
import { FileText, Plus, ExternalLink, X, ClipboardList } from "lucide-react"

interface Form {
  id: number
  title: string
  description: string
  submissionCount?: number
  created?: string
}

interface ScrollsViewProps {
  guildId: string
  guildName: string
}

export function ScrollsView({ guildId, guildName }: ScrollsViewProps) {
  const [myForms, setMyForms] = useState<Form[]>([])
  const [sharedForms, setSharedForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true)
      const [myRes, sharedRes] = await Promise.all([
        fetch("/api/forms"),
        fetch("/api/forms/shared"),
      ])

      if (myRes.ok) {
        const myData = await myRes.json()
        setMyForms(Array.isArray(myData) ? myData : myData.forms || [])
      }

      if (sharedRes.ok) {
        const sharedData = await sharedRes.json()
        setSharedForms(Array.isArray(sharedData) ? sharedData : sharedData.forms || [])
      }
    } catch (err) {
      console.error("Failed to fetch forms:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setCreating(true)
    setError(null)

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      })

      if (!res.ok) {
        throw new Error("Failed to create scroll")
      }

      setTitle("")
      setDescription("")
      setShowCreateForm(false)
      await fetchForms()
    } catch (err) {
      setError("Failed to create scroll. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const allForms = [...myForms, ...sharedForms]
  const hasAnyForms = allForms.length > 0

  return (
    <div className="flex h-full flex-col p-6 lg:p-8">
      <ChamberHeader
        backHref={`/guild/${guildId}`}
        icon={<FileText className="h-10 w-10 text-guild" />}
        title="Scrolls"
        subtitle={`Inquiries & forms of ${guildName}`}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-guild px-4 py-2 text-sm font-medium text-black-deep transition-colors hover:bg-guild/80"
        >
          {showCreateForm ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create a Scroll
            </>
          )}
        </button>
        <a
          href="https://scrolls.skymasons.xyz/apps/forms/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-dark px-4 py-2 text-sm text-gray transition-colors hover:border-guild/50 hover:text-guild"
        >
          <ExternalLink className="h-4 w-4" />
          Open Forms
        </a>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-white">
              New Scroll
            </h3>
            <div>
              <label className="mb-1.5 block text-sm text-gray">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name your scroll..."
                className="w-full rounded-lg border border-gray-dark bg-black-deep px-3 py-2 text-sm text-white placeholder-gray focus:border-guild focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this scroll about?"
                className="w-full rounded-lg border border-gray-dark bg-black-deep px-3 py-2 text-sm text-white placeholder-gray focus:border-guild focus:outline-none"
              />
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={creating || !title.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-guild px-4 py-2 text-sm font-medium text-black-deep transition-colors hover:bg-guild/80 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {creating ? "Creating..." : "Create Scroll"}
            </button>
          </form>
        </Card>
      )}

      <div className="flex-1">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray">Loading scrolls...</p>
          </div>
        ) : !hasAnyForms ? (
          <EmptyState
            message="No scrolls await your response..."
            description="Create one to gather wisdom from the brotherhood."
          />
        ) : (
          <div className="space-y-6">
            {myForms.length > 0 && (
              <div>
                <h2 className="font-display mb-3 text-lg font-semibold text-white">
                  Your Scrolls
                </h2>
                <div className="space-y-2">
                  {myForms.map((form) => (
                    <FormCard key={`my-${form.id}`} form={form} />
                  ))}
                </div>
              </div>
            )}
            {sharedForms.length > 0 && (
              <div>
                <h2 className="font-display mb-3 text-lg font-semibold text-white">
                  Shared with You
                </h2>
                <div className="space-y-2">
                  {sharedForms.map((form) => (
                    <FormCard key={`shared-${form.id}`} form={form} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FormCard({ form }: { form: Form }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-guild/10">
          <ClipboardList className="h-5 w-5 text-guild" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate">{form.title}</CardTitle>
          {form.description && (
            <p className="mt-0.5 truncate text-sm text-gray">{form.description}</p>
          )}
        </div>
        {form.submissionCount !== undefined && (
          <div className="flex-shrink-0 text-right">
            <span className="text-sm text-guild">{form.submissionCount}</span>
            <span className="ml-1 text-xs text-gray">
              {form.submissionCount === 1 ? "response" : "responses"}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
