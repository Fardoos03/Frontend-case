import React from 'react';
import Table from '../widgets/table';
import { Card } from '../widgets/card';
import { SaleRecord } from '../types';
import { formatValue } from '../lib/format';

interface Props {
	sales: SaleRecord[];
}

export const RecentSalesView = ({ sales }: Props) => {
	return (
		<Card>
			<Card.InsetBody>
				<Table>
					<Table.Headers>
						<Table.Header>User</Table.Header>
						<Table.Header>Product</Table.Header>
						<Table.Header>Value</Table.Header>
					</Table.Headers>
					<Table.Body>
						{/* Explicit empty state until live events arrive. */}
						{sales.length === 0 ? (
							<Table.Row>
								<Table.Cell>No sales yet</Table.Cell>
								<Table.Cell>-</Table.Cell>
								<Table.Cell>-</Table.Cell>
							</Table.Row>
						) : (
							// Most recent sales are already ordered in dashboard state.
							sales.map((sale) => (
								<Table.Row key={sale.id}>
									<Table.Cell>{sale.user.name}</Table.Cell>
									<Table.Cell>{sale.product.name}</Table.Cell>
									<Table.Cell>{formatValue(sale.value)}</Table.Cell>
								</Table.Row>
							))
						)}
					</Table.Body>
				</Table>
			</Card.InsetBody>
		</Card>
	)
}
