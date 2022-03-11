import React, {useContext, useEffect, useState} from "react";
import {formatDate} from "../../Utilities/methods";
import {typeTransaction} from "../../Utilities/types";
import TransactionForm from "./TransactionForm";

// export const TransactionContext = React.createContext<typeTransaction[]>([]);
// export const TransactionContext = React.createContext<typeTransaction[]>([]);
export const TransactionContext = React.createContext<any>([[], () => {}]);

// Affiche des transactions
// "sans details"
export default function Transactions() {
	const [items, setItems] = useState<typeTransaction[]>([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetch(`http://localhost:5000/transactions`)
			.then((res) => res.json())
			.then(
				(result) => {
					setItems(result);
				},
				(error) => setError(error),
			);
	}, []);

	if (error) {
		return <section>Error: {JSON.stringify(error)}</section>;
	} else {
		return (
			<TransactionContext.Provider value={[items, setItems]}>
				{/* <TransactionContext.Provider value={items}> */}
				<section>
					{/* <h3>Transactions</h3> */}
					<TransactionForm />

					<table>
						<thead>
							<tr>
								{/* <th colSpan={10} style={{borderBottom: "1px solid black"}}> */}
								<th colSpan={10} className="borderBot">
									Transactions
								</th>
							</tr>
							<tr>
								<th className="borderRight">id</th>
								<th className="borderRight">from</th>
								<th className="borderRight">to</th>
								<th className="borderRight">amount</th>
								<th className="borderRight">type</th>
								<th className="borderRight">initiated by</th>
								<th className="borderRight">status</th>
								<th className="borderRight">created</th>
								<th>last update</th>
							</tr>
						</thead>

						<tbody>
							{items.map((item) => (
								<tr key={item.transaction_id}>
									<td className="borderRight">{item.transaction_id}</td>
									<td className="borderRight">{item.from_account_id}</td>
									<td className="borderRight">{item.to_account_id}</td>
									<td className="borderRight">{item.amount} €</td>
									<td className="borderRight">{item.type}</td>
									<td className="borderRight">{item.initiated_by}</td>
									<td className="borderRight">{item.status_code ? "actived" : "deactivated"}</td>
									<td className="borderRight">{formatDate(item.createdAt)}</td>
									<td>{formatDate(item.updatedAt)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			</TransactionContext.Provider>
		);
	}
}
