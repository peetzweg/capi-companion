import {westend} from '@capi/westend';
import {ss58} from 'capi';
import SelectInput from 'ink-select-input';
import React, {useCallback, useMemo} from 'react';
import {Account, useAccounts} from '../../hooks/useAccounts.js';

export default function Index() {
	const {accounts} = useAccounts();

	const items = useMemo(
		() =>
			Object.entries(accounts).map(([, account]) => ({
				key: account.publicKey,
				label: account.name || 'unnamed',
				value: account,
			})),
		[accounts],
	);

	const handleSelect = useCallback((item: {value: Account}) => {
		const rawPupKey = ss58.decode(item.value.publicKey)[1];
		westend.System.Account.value(rawPupKey)
			.run()
			.then(accountInfo => {
				console.log({address: item.value.publicKey, info: accountInfo});
			});
	}, []);

	return <SelectInput items={items} onSelect={handleSelect} />;
}
