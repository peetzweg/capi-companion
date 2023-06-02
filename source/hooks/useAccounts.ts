import fs from 'fs';
import os from 'os';
import path from 'path';
import {useCallback, useEffect, useMemo, useState} from 'react';
import zod from 'zod';

const publicKeySchema = zod.string();

const baseAccountSchema = zod.object({
	name: zod.string().optional(),
	publicKey: publicKeySchema,
});

const userAccountSchema = baseAccountSchema.extend({
	secret: zod.string(),
	type: zod.literal('user'),
});

const multisigAccountSchema = baseAccountSchema.extend({
	type: zod.literal('multisig'),
	members: zod.array(publicKeySchema),
	threshold: zod.number(),
});

const accountSchema = zod.union([userAccountSchema, multisigAccountSchema]);

export const accountsSchema = zod
	.record(publicKeySchema, accountSchema)
	.default({});

export type UserAccount = zod.infer<typeof userAccountSchema>;
export const isUserAccount = (obj: any): obj is UserAccount => {
	return userAccountSchema.safeParse(obj).success;
};
export type MultisigAccount = zod.infer<typeof multisigAccountSchema>;
export const isMultisigAccount = (obj: any): obj is MultisigAccount => {
	return multisigAccountSchema.safeParse(obj).success;
};

export type Account = zod.infer<typeof accountSchema>;
type Accounts = zod.infer<typeof accountsSchema>;

const CONFIG_FILE_NAME = '.accounts';

export function useAccounts() {
	const [isLoading, setLoading] = useState(true);
	const [accounts, setAccounts] = useState<Accounts>({});
	const userAccounts = useMemo(
		() =>
			Object.entries(accounts)
				.map(([, account]) => account)
				.filter(account => isUserAccount(account)) as Array<UserAccount>,
		[accounts],
	);

	const multisigAccounts = useMemo(
		() =>
			Object.entries(accounts)
				.map(([, account]) => account)
				.filter(account =>
					isMultisigAccount(account),
				) as Array<MultisigAccount>,
		[accounts],
	);

	const pathToFile = useMemo(
		() => path.join(os.homedir() + '/' + CONFIG_FILE_NAME),
		[],
	);

	useEffect(
		function readAccountsFromDisk() {
			if (!fs.existsSync(pathToFile)) return;

			const fileData = fs.readFileSync(pathToFile, 'utf-8');
			const fileDataJSON = JSON.parse(fileData);
			try {
				const parseAccounts = accountsSchema.parse(fileDataJSON);
				setAccounts(parseAccounts);
			} catch (error) {
				console.error('Config unable to be loaded. Invalid file.', error);
			} finally {
				setLoading(false);
			}
		},
		[pathToFile],
	);

	const saveAccount = useCallback(
		(account: Account) => {
			setAccounts(accounts => {
				const alreadyExists =
					Object.keys(accounts).findIndex(key => key === account.publicKey) !==
					-1;
				if (alreadyExists) {
					throw new Error('Account already exists');
				}
				const newAccounts = {...accounts, [account.publicKey]: account};
				fs.writeFileSync(pathToFile, JSON.stringify(newAccounts));
				return newAccounts;
			});
		},
		[accounts],
	);
	return {isLoading, accounts, saveAccount, multisigAccounts, userAccounts};
}
