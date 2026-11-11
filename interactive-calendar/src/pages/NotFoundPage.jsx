import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>We couldn&apos;t find that page.</p>
      <Link to="/">Return home</Link>
    </section>
  )
}

export default NotFoundPage
