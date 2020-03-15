import plusnew, { component, store } from '@plusnew/core';

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

type item = {
	gtin: string;
	amount: number;
	artist: string;
	title: string;
	configuration: string;
};

type distributor = {
	name: string;
	items: item[];
};

type addItemAction = {
	type: 'ADD_ITEM';
	payload: apiItem;
};

type actions = addItemAction;

export default component('App', () => {
	const search = store('');
	const distributors = store<distributor[], actions>([], (previousState, action) => {
		if (action.type === 'ADD_ITEM') {
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
									distributors.dispatch({
										type: 'ADD_ITEM',
										payload: result.searchResult.resultItems[0]
									});
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
						<div key={distributor.name}>
							{distributor.name}
							<table>
								{distributor.items.map((item) => (
									<tr key={item.gtin}>
										<td>{item.amount}</td>
										<td>{item.artist}</td>
										<td>{item.title}</td>
										<td>{item.configuration}</td>
										<td>{item.gtin}</td>
									</tr>
								))}
							</table>
						</div>
					))}
			</distributors.Observer>
		</div>
	);
});
