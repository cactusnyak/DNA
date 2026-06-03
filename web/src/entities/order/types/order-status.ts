export type OrderStatus =
	| 'created'
	| 'awaiting_payment'
	| 'paid'
	| 'shipped'
	| 'delivered'
	| 'cashback_accrued'
	| 'cancelled';