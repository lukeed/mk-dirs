export interface Options {
	cwd: string;
	mode: number;
}

export function mkdir(filepath: string, options?: Partial<Options>): string;
