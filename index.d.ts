declare module 'mk-dirs' {
	export interface Options {
		cwd: string,
		mode: number,
	}
	function mkdirs(filepath: string, options?: Partial<Options>): Promise<string>;
	export = mkdirs;
}

declare module 'mk-dirs/sync' {
	export interface Options {
		cwd: string,
		mode: number,
	}
	function mkdirs(filepath: string, options?: Partial<Options>): string;
	export = mkdirs;
}
