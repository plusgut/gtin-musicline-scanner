declare module '*.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.gif';
declare module 'text-table' {
	const table: (items: string[][]) => string;
	export = table;
}
