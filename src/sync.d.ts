export interface Options {
	cwd: string,
	mode: number,
}

declare function mkdirs(filepath: string, options?: Partial<Options>): string;
export = mkdirs;
