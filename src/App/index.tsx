import plusnew, { component, store } from '@plusnew/core';

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
									Accept: 'application/json, text/javascript, */*; q=0.01',
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									searchTerm: searchState,
									isAvailable: true
									// orderBy: 'score'
									// isReverseOrder: false,
									// offset: 0,
									// limit: 50,
									// analyzeFilters: true,
									// fieldTerms: [],
									// filterTerms: [],
									// releaseDateFrom: null,
									// releaseDateTo: null,
									// releaseDateTerm: 'custom'
								})
							}).then(() => {
								console.log('result');
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
				{(distributorsState) => distributorsState.map((distributor) => <div>{distributor.name}</div>)}
			</distributors.Observer>
		</div>
	);
});
