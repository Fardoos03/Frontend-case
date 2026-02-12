import { Users, Products } from './_private/db'

export interface SalesEvent {
	type: 'sale';
	userId: number;
	productId: number;
	duration: number;
}

interface SaleEventCallback {
	(event: SalesEvent): void;
}

export class SalesEventHub {
	private state = 'init'
	private timer = null
	private observers = [];
	constructor() {
		this.timer = setInterval(() => this.main(), 1000)
	}
	connect() {
		return new Promise<boolean>(resolve => setTimeout(() => {
			this.state = 'ready'
			resolve(true);
		}, 500));
	}

	registerSalesEventListener(callback: SaleEventCallback) {
		this.observers.push(callback)
	}

	unregisterSalesEventListener(callback: SaleEventCallback) {
		this.observers = this.observers.filter(e => e !== callback)
	}

	private dispatchEvent(msg: SalesEvent) {
		this.observers.forEach(observer => observer(msg))
	}

	private main() {
		if (this.state !== 'ready') {
			return;
		}
		if (gaussianRand() > 0.53) {
			this.dispatchEvent(this.buildEvent())
		}
	}

	private buildEvent(): SalesEvent {
		const userId = Users[Users.length * gaussianRand() | 0].id;
		const productId = Products[Products.length * Math.random() | 0].id;
		const terms = [1, 2, 3, 6, 9, 12];
		const duration = terms[terms.length * Math.random() | 0];

		return {
			type: 'sale',
			userId,
			productId,
			duration
		}
	}
}


function gaussianRand() {
	const resolution = 32;
	let rand = 0;

	for (let i = 0; i < resolution; i += 1) {
		rand += Math.random();
	}

	return rand / resolution;
}
