import React from 'react';
import { Card } from './card';
import { SaleRecord } from '../types';
import { formatValue } from '../lib/format';

interface Props {
	sale: SaleRecord | null;
}

export const SplashModal = ({ sale }: Props) => {
	// No active sale means no splash should be shown.
	if (!sale) {
		return null;
	}

	return (
		// Toast-style splash: keeps dashboard visible while highlighting each sale.
		<div className="fixed bottom-5 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-full sm:max-w-sm pointer-events-none">
			<Card className="shadow-xl">
				<div className="flex items-start justify-between gap-6">
					<div className="min-w-0">
						<p className="text-xs uppercase tracking-wide text-gray-500">New sale</p>
						<h2 className="text-xl font-semibold text-black mt-1 truncate">
							{sale.user.name}
						</h2>
						<p className="text-base text-gray-700 mt-1 truncate">
							{sale.product.name}
						</p>
					</div>
					<div className="text-right shrink-0">
						<p className="text-2xl font-bold text-black">
							{formatValue(sale.value)}
						</p>
						<p className="text-sm text-gray-500">
							{sale.duration} months
						</p>
					</div>
				</div>
			</Card>
		</div>
	)
}
