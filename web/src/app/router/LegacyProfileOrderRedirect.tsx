import { Navigate, useParams } from 'react-router-dom';

export function LegacyProfileOrderRedirect() {
  const { orderId } = useParams();

  return <Navigate to={orderId ? `/orders/${orderId}` : '/profile'} replace />;
}
