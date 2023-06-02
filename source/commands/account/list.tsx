import {Box, Text} from 'ink';

import React, {useMemo} from 'react';
import {useAccounts} from '../../hooks/useAccounts.js';

export default function Index() {
	const {accounts} = useAccounts();

	const entries = useMemo(() => Object.entries(accounts), [accounts]);

	return (
		<Box flexDirection="column">
			{entries.map(([, account]) => (
				<Text key={account.publicKey}>
					{account.name || 'unnamed'} ({account.publicKey}) [{account.type}]
				</Text>
			))}
		</Box>
	);
}
