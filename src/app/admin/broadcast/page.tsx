'use client'

import { useState } from 'react'

export default function BroadcastPage() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'info',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        alert(
          `Broadcast sent successfully to ${data.recipientCount} citizens!`
        )
        setFormData({ title: '', message: '', severity: 'info' })
      }
    } catch (error) {
      console.error('Broadcast error:', error)
      alert('Failed to send broadcast')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Emergency Broadcast</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Heavy Rainfall Alert"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                required
                className="w-full px-3 py-2 border rounded"
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Enter emergency message..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Severity
              </label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value })
                }
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Sending...' : 'Send Emergency Broadcast'}
            </button>
          </form>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This will send notifications to all
            registered citizens. Use only for genuine emergencies.
          </p>
        </div>
      </div>
    </div>
  )
}