export interface Options {
	cwd: string,
	mode: number,
}
declare const mkdirs: (filepath: string, options?: Partial<Options>) => Promise<string>;
export default mkdirs;
