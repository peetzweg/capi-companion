import {Westend, westend} from '@capi/westend';
import {ss58} from 'capi';
import {MultisigRune} from 'capi/patterns/multisig';
import {Text} from 'ink';
import SelectInput from 'ink-select-input';
import React, {useCallback, useEffect, useState} from 'react';
import {
	MultisigAccount,
	UserAccount,
	useAccounts,
} from '../../hooks/useAccounts.js';

type Item = {
	key: string;
	label: string;
	value: UserAccount;
};

export default function Index() {
	const {userAccounts, saveAccount} = useAccounts();
	const [selectedAccounts, setSelectedAccounts] = useState<Array<UserAccount>>(
		[],
	);
	const [items, setItems] = useState<Array<Item>>([]);
	const [multisig, setMultisig] = useState<MultisigAccount | undefined>(
		undefined,
	);

	useEffect(() => {
		setItems(
			userAccounts.map(account => ({
				key: account.publicKey,
				label: account.name || 'unnamed',
				value: account,
			})),
		);
	}, [userAccounts]);

	const handleSelect = useCallback(
		({value}: {value: UserAccount}) => {
			setSelectedAccounts([...selectedAccounts, value]);
			setItems(items.filter(i => i.value.publicKey !== value.publicKey));
		},
		[selectedAccounts, items],
	);

	useEffect(() => {
		if (selectedAccounts.length !== 3) return;
		setMultisig(undefined);

		const signatories = selectedAccounts.map(
			member => ss58.decode(member.publicKey)[1],
		);

		const multisig: MultisigRune<Westend, never> = MultisigRune.from(westend, {
			signatories,
			threshold: 2,
		});
		Promise.all([westend.addressPrefix().run(), multisig.accountId.run()]).then(
			([addressPrefix, accountId]) => {
				const multisigAccount: MultisigAccount = {
					publicKey: ss58.encode(addressPrefix, accountId),
					type: 'multisig',
					threshold: 2,
					members: selectedAccounts.map(account => account.publicKey),
				};
				saveAccount(multisigAccount);
				setMultisig(multisigAccount);
			},
		);
	}, [selectedAccounts]);

	return multisig ? (
		<Text>Multisig:{multisig.publicKey}</Text>
	) : (
		<SelectInput items={items} onSelect={handleSelect} />
	);
}
