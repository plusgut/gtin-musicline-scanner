import plusnew, { component, store } from '@plusnew/core';
import Distributor, { item } from './components/Distributor';

type apiResponse = {
	searchResult: {
		fieldGroupItems: [];
		filterGroupItems: [];
		limit: number;
		offset: number;
		resultItems: apiItem[];
	};
};

type apiItem = {
	artist: string;
	artwork: string;
	configuration: string;
	distributor_name: string;
	genre: string;
	gtin: string;
	label_name: string;
	physical_release_date: string;
	set_total: number;
	title: string;
};

type distributor = {
	name: string;
	items: item[];
};

type addItemAction = {
	type: 'ADD_ITEM';
	payload: apiItem;
};

type deleteItemAction = {
	type: 'DELETE_ITEM';
	payload: {
		gtin: string;
	};
};

type actions = addItemAction | deleteItemAction;

export default component('App', () => {
	const search = store('');
	const distributors = store<distributor[], actions>([], (previousState, action) => {
		if (action.type === 'ADD_ITEM') {
			const distributor = previousState.find(
				(distributor) => distributor.name === action.payload.distributor_name
			);
			if (distributor) {
				return previousState.map((distributor) => {
					if (distributor.name === action.payload.distributor_name) {
						const item = distributor.items.find((item) => item.gtin === action.payload.gtin);
						if (item) {
							return {
								name: distributor.name,
								items: distributor.items.map(
									(item) =>
										item.gtin === action.payload.gtin
											? {
													...item,
													amount: item.amount + 1
												}
											: item
								)
							};
						}
						return {
							name: distributor.name,
							items: [
								...distributor.items,
								{
									gtin: action.payload.gtin,
									amount: 1,
									artist: action.payload.artist,
									title: action.payload.title,
									configuration: action.payload.configuration
								}
							]
						};
					}
					return distributor;
				});
			}
			return [
				...previousState,
				{
					name: action.payload.distributor_name,
					items: [
						{
							gtin: action.payload.gtin,
							amount: 1,
							artist: action.payload.artist,
							title: action.payload.title,
							configuration: action.payload.configuration
						}
					]
				}
			];
		}

		if (action.type === 'DELETE_ITEM') {
			return previousState.map((distributor) => {
				const item = distributor.items.find((item) => item.gtin === action.payload.gtin);

				if (item) {
					if (item.amount > 1) {
						return {
							name: distributor.name,
							items: distributor.items.map(
								(item) =>
									item.gtin === action.payload.gtin
										? {
												...item,
												amount: item.amount - 1
											}
										: item
							)
						};
					}
					return {
						name: distributor.name,
						items: distributor.items.filter((item) => item.gtin !== action.payload.gtin)
					};
				}
				return distributor;
			});
		}
		throw new Error('No such action');
	});

	return (
		<div>
			<search.Observer>
				{(searchState) => (
					<form
						onsubmit={(evt) => {
							evt.preventDefault();
							search.dispatch('');
							fetch('/api', {
								method: 'POST',
								headers: {
									Accept: 'application/json',
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									searchTerm: searchState,
									isAvailable: true,
									orderBy: 'score',
									isReverseOrder: false,
									offset: 0,
									limit: 50,
									analyzeFilters: true,
									fieldTerms: [],
									filterTerms: [],
									releaseDateFrom: null,
									releaseDateTo: null,
									releaseDateTerm: 'custom'
								})
							})
								.then((response) => response.json() as Promise<apiResponse>)
								.then((result) => {
									if (result.searchResult.resultItems) {
										distributors.dispatch({
											type: 'ADD_ITEM',
											payload: result.searchResult.resultItems[0]
										});
									}
								});
						}}
					>
						<input
							autofocus={true}
							type="text"
							value={searchState}
							oninput={(evt) => search.dispatch(evt.currentTarget.value)}
						/>
					</form>
				)}
			</search.Observer>

			<distributors.Observer>
				{(distributorsState) =>
					distributorsState.map((distributor) => (
						<Distributor
							key={distributor.name}
							name={distributor.name}
							items={distributor.items}
							onDelete={(gtin) =>
								distributors.dispatch({
									type: 'DELETE_ITEM',
									payload: {
										gtin: gtin
									}
								})}
						/>
					))}
			</distributors.Observer>
		</div>
	);
});
