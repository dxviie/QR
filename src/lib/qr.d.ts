export interface QrConfig {
	value: string;
	ecl: 'L' | 'M' | 'Q' | 'H';
	penMmSize: number;
	// horizontal & vertical blocks start from the full set of blocks
	overlap: boolean;
	transparent: boolean;
}

export interface QrOutput {
	svg: string | SVGElement;
	outputInfo: string;
	remark: string;
}
