import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function AdminSupportPage() {
  const { slug } = useParams()

  useEffect(() => {
    if (slug) {
      localStorage.setItem('admin_slug', slug)
    }
    window.location.href = '/app'
  }, [slug])

  return null
}
