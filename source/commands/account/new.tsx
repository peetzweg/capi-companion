import {westend} from '@capi/westend';
import {Sr25519, hex, ss58} from 'capi';
import * as crypto from 'crypto';
import {Box, Text} from 'ink';
import TextInput from 'ink-text-input';
import React, {useCallback, useState} from 'react';
import zod from 'zod';
import {UserAccount, useAccounts} from '../../hooks/useAccounts.js';
export const options = zod.object({
	name: zod.string().default('Stranger').describe('Name'),
});

export default function Index() {
	const {isLoading, saveAccount} = useAccounts();
	const [name, setName] = useState('');
	const [account, setAccount] = useState<UserAccount | undefined>(undefined);

	const createNewAccount = useCallback((submittedName: string) => {
		const secret = crypto.getRandomValues(new Uint8Array(64));
		const kp = Sr25519.fromSecret(secret);
		const address = ss58.encode(westend.System.SS58Prefix, kp.publicKey);

		const account: UserAccount = {
			publicKey: address,
			type: 'user',
			name: submittedName,
			secret: hex.encode(secret),
		};

		saveAccount(account);
		setAccount(account);
	}, []);

	if (isLoading) return null;

	return !account ? (
		<Box>
			<Text>Account name: </Text>
			<TextInput value={name} onChange={setName} onSubmit={createNewAccount} />
		</Box>
	) : (
		<Text>
			Created '{name}': {account.publicKey}
		</Text>
	);
}
