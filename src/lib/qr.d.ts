export interface QrConfig {
	value: string;
	mmSize: number;
	ecl: 'L' | 'M' | 'Q' | 'H';
	penMmSize: number;
	penTip: 'Round' | 'Square';
	// horizontal & vertical blocks start from the full set of blocks
	overlap: boolean;
}

export interface QrOutput {
	svg: string | SVGElement;
	totalPathLength: number;
	remark: string;
}
