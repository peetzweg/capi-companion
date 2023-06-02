import {Box, Text} from 'ink';

import {ChainRune, WsConnection} from 'capi';
import React from 'react';

export default function Index() {
	/// We could also initialize a `ChainRune` with `WsConnection` and an RPC node WebSocket URL.
	const chain = ChainRune.from(
		WsConnection.bind('wss://westend-rpc.polkadot.io'),
	);

	/// Create a binding to the `System` pallet.
	const System = chain.pallet('System');

	/// Create a binding to the `Account` storage map.
	const Account = System.storage('Account');
	console.log({Account});

	return (
		<Box flexDirection="column">
			<Text>Dynamic Demo</Text>
		</Box>
	);
}
