// Shared UI models used across dashboard, views, and splash components.
export interface User {
	type: 'user';
	id: number;
	name: string;
}

export interface Product {
	type: 'product';
	id: number;
	name: string;
	unitPrice: number;
}

export interface SaleRecord {
	id: number;
	user: User;
	product: Product;
	duration: number;
	value: number;
	timestamp: number;
}

export interface TopSeller {
	user: User;
	total: number;
}
