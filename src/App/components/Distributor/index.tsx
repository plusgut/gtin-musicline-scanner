import plusnew, { component, Props } from '@plusnew/core';
import * as table from 'text-table';

type props = {
	name: string;
	items: item[];
	onDelete: (gtin: string) => void;
};

export type item = {
	gtin: string;
	amount: number;
	artist: string;
	title: string;
	configuration: string;
};

export function convertItemsToText(items: item[]) {
	return table([
		[ 'Anzahl', 'EAN', 'Artist', 'Titel', 'Format' ],
		...items.map((item) => [ `${item.amount}`, item.gtin, item.artist, item.title, item.configuration ])
	]);
}

export default component(__dirname, (Props: Props<props>) => (
	<Props>
		{(props) => (
			<div key={props.name}>
				<span>{props.name} - </span>
				<a
					download={`${props.name}-${new Date().toISOString()}.txt`}
					href={`data:text/plain;charset=utf-8,${convertItemsToText(props.items)}`}
				>
					Download
				</a>
				<table>
					<thead>
						<td>Anzahl</td>
						<td>Künstler</td>
						<td>Titel</td>
						<td>Format</td>
						<td>EAN</td>
						<td />
					</thead>
					<tbody>
						{props.items.map((item) => (
							<tr key={item.gtin}>
								<td>{item.amount}</td>
								<td>{item.artist}</td>
								<td>{item.title}</td>
								<td>{item.configuration}</td>
								<td>{item.gtin}</td>
								<td
									onclick={() => {
										props.onDelete(item.gtin);
									}}
								>
									x
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<br />
			</div>
		)}
	</Props>
));
