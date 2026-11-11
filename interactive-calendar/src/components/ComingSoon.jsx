import { Link } from 'react-router-dom'
import Card from './Card.jsx'

function ComingSoon({ title, children }) {
  return (
    <Card>
      <h1>{title}</h1>
      <p>{children}</p>
      <p>These features are not available yet.</p>
      <Link to="/">Return to calendar</Link>
    </Card>
  )
}

export default ComingSoon
