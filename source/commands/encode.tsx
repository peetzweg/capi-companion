import {westend} from '@capi/westend';
import * as $ from 'capi';
import {Text} from 'ink';
import {argument} from 'pastel';
import React from 'react';
import zod from 'zod';

export const options = zod.object({
	prefix: zod.number().describe('prefix').default(westend.System.SS58Prefix),
});

export const args = zod.tuple([
	zod.enum(['ss58', 'hex']).describe(
		argument({
			name: 'codec',
			description: 'Codec Name',
		}),
	),
	zod.string().describe('data'),
]);

type Props = {
	options: zod.infer<typeof options>;
	args: zod.infer<typeof args>;
};

function parseData(data: string): Uint8Array {
	if (data.startsWith('0x')) {
		return $.hex.decode(data);
	} else if (data.includes(',')) {
		return Uint8Array.from(data.split(',').map(x => parseInt(x)));
	}
	throw new Error('Invalid data');
}

export default function Index({options, args}: Props) {
	const [codec, data] = args;

	switch (codec) {
		case 'ss58':
			return <Text>{$.ss58.encode(options.prefix, parseData(data))}</Text>;
		case 'hex':
			return <Text>{$.hex.encode(parseData(data))}</Text>;
	}
}
