import React from 'react';
import Table from '../widgets/table';
import { Card } from '../widgets/card';
import { formatValue } from '../lib/format';
import { TopSeller } from '../types';

interface Props {
	sellers: TopSeller[];
}

export const TopSalesView = ({ sellers }: Props) => {
	return (
		<Card>
			<Card.InsetBody>
				<Table>
					<Table.Headers>
						<Table.Header>User</Table.Header>
						<Table.Header>Value</Table.Header>
					</Table.Headers>
					<Table.Body>
						{/* Explicit empty state so the table is still meaningful before first event. */}
						{sellers.length === 0 ? (
							<Table.Row>
								<Table.Cell>No sales yet</Table.Cell>
								<Table.Cell>-</Table.Cell>
							</Table.Row>
						) : (
							// Each row: seller name + accumulated sales value.
							sellers.map((seller) => (
								<Table.Row key={seller.user.id}>
									<Table.Cell>{seller.user.name}</Table.Cell>
									<Table.Cell>{formatValue(seller.total)}</Table.Cell>
								</Table.Row>
							))
						)}
					</Table.Body>
				</Table>
			</Card.InsetBody>
		</Card>
	)
}
