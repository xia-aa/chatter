import { createFileRoute } from '@tanstack/react-router';
import { XaaGoogle } from '@xaa/icon-react';
import { GoalIcon } from 'lucide-react';
import { useState } from 'react';
import { to } from '#/lib/utils/fp.ts';

export const Route = createFileRoute('/integration/better-auth/webauthn')({
	component: WebAuthnDemo,
});

function WebAuthnDemo() {
	const [isSupported, setIsSupported] = useState<boolean | null>(null);
	const [status, setStatus] = useState('');
	const [error, setError] = useState('');
	const [credential, setCredential] = useState<PublicKeyCredential | null>(
		null,
	);
	const [credentialData, setCredentialData] = useState<string>('');

	// 检查 WebAuthn 支持
	const checkSupport = () => {
		const supported =
			typeof PublicKeyCredential !== 'undefined' &&
			typeof navigator.credentials !== 'undefined' &&
			typeof navigator.credentials.create === 'function';
		setIsSupported(supported);
		setStatus(
			supported
				? '✅ WebAuthn is supported in your browser'
				: '❌ WebAuthn is NOT supported',
		);
		setError('');
	};

	// 注册（创建凭证）- 模拟注册流程
	const registerCredential = async () => {
		setStatus('🔐 Waiting for biometric verification...');
		setError('');

		// 模拟 challenge（实际应由服务器生成）
		const challenge = new Uint8Array(32);
		crypto.getRandomValues(challenge);

		// 创建 PublicKey 选项
		const publicKeyOptions: PublicKeyCredentialCreationOptions = {
			rp: {
				name: 'Demo App',
				id: window.location.hostname,
			},
			user: {
				id: new Uint8Array(16),
				name: 'demo-user',
				displayName: 'Demo User',
			},
			challenge,
			pubKeyCredParams: [
				{ type: 'public-key', alg: -7 }, // ES256
				{ type: 'public-key', alg: -257 }, // RS256
			],
			timeout: 60000,
			attestation: 'none',
			authenticatorSelection: {
				authenticatorAttachment: 'platform',
				userVerification: 'required',
			},
		};

		// 调用 WebAuthn API
		const [credentialResult, err] = await to(
			navigator.credentials.create({
				publicKey: publicKeyOptions,
			}) as Promise<PublicKeyCredential>,
		);
		if (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			setError(`❌ ${errorMessage}`);
			setStatus('');
			return;
		}

		setCredential(credentialResult);
		setCredentialData(
			JSON.stringify(
				{
					id: credentialResult.id,
					type: credentialResult.type,
					rawId: Array.from(new Uint8Array(credentialResult.rawId)),
					authenticatorAttachment: credentialResult.authenticatorAttachment,
				},
				null,
				2,
			),
		);
		setStatus('🎉 Credential created successfully!');
	};

	// 登录（获取凭证）- 模拟登录流程
	const loginWithCredential = async () => {
		try {
			if (!credential) {
				setError('No credential found. Please register first.');
				return;
			}

			setStatus('🔐 Waiting for biometric verification...');
			setError('');

			// 模拟 challenge
			const challenge = new Uint8Array(32);
			crypto.getRandomValues(challenge);

			const publicKeyOptions: PublicKeyCredentialRequestOptions = {
				challenge,
				timeout: 60000,
				userVerification: 'required',
			};

			// 调用 WebAuthn API
			const credentialResult = (await navigator.credentials.get({
				publicKey: publicKeyOptions,
			})) as PublicKeyCredential;

			setCredentialData(
				JSON.stringify(
					{
						id: credentialResult.id,
						type: credentialResult.type,
						rawId: Array.from(new Uint8Array(credentialResult.rawId)),
						authenticatorAttachment: credentialResult.authenticatorAttachment,
					},
					null,
					2,
				),
			);
			setStatus('✅ Authentication successful!');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			setError(`❌ ${errorMessage}`);
			setStatus('');
		}
	};

	return (
		<div className="flex justify-center py-10 px-4">
			<div className="w-full max-w-2xl p-6 space-y-6">
				<h1 className="text-2xl font-semibold">WebAuthn (Fingerprint) Demo</h1>
				<p className="text-sm text-neutral-500 dark:text-neutral-400">
					WebAuthn is a web standard for passwordless authentication using
					biometrics, security keys, etc.
				</p>

				{/* 支持状态检查 */}
				<div className="p-4 border border-neutral-300 dark:border-neutral-700 rounded-lg space-y-4">
					<h2 className="text-lg font-medium">1. Check Browser Support</h2>
					<button
						onClick={checkSupport}
						className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-md"
					>
						Check Support
					</button>
					{isSupported !== null && (
						<p
							className={`text-sm ${isSupported ? 'text-green-600' : 'text-red-600'}`}
						>
							{status}
						</p>
					)}
				</div>

				{/* 注册凭证 */}
				<div className="p-4 border border-neutral-300 dark:border-neutral-700 rounded-lg space-y-4">
					<h2 className="text-lg font-medium">
						2. Register (Create Credential)
					</h2>
					<p className="text-sm text-neutral-500 dark:text-neutral-400">
						This simulates registering a new credential with biometric
						verification.
					</p>
					<button
						onClick={registerCredential}
						disabled={isSupported === false}
						className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
					>
						<XaaGoogle />
						Register with Biometrics
					</button>
				</div>

				{/* 登录验证 */}
				<div className="p-4 border border-neutral-300 dark:border-neutral-700 rounded-lg space-y-4">
					<h2 className="text-lg font-medium">3. Authenticate (Verify)</h2>
					<p className="text-sm text-neutral-500 dark:text-neutral-400">
						This simulates authenticating using the registered credential.
					</p>
					<button
						onClick={loginWithCredential}
						disabled={!credential || isSupported === false}
						className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
					>
						Verify with Biometrics
					</button>
				</div>

				{/* 状态显示 */}
				{status && (
					<div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
						<p className="text-sm text-green-700 dark:text-green-400">
							{status}
						</p>
					</div>
				)}

				{/* 错误显示 */}
				{error && (
					<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
						<p className="text-sm text-red-700 dark:text-red-400">{error}</p>
					</div>
				)}

				{/* 凭证数据 */}
				{credentialData && (
					<div className="p-4 border border-neutral-300 dark:border-neutral-700 rounded-lg space-y-2">
						<h3 className="text-sm font-medium">Credential Data:</h3>
						<pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded overflow-x-auto">
							{credentialData}
						</pre>
					</div>
				)}

				{/* 技术说明 */}
				<div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
					<h3 className="text-sm font-medium">How it works:</h3>
					<ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 list-disc list-inside">
						<li>
							<code> navigator.credentials.create()</code> - Register a new
							credential (biometric)
						</li>
						<li>
							<code> navigator.credentials.get()</code> - Authenticate with
							existing credential
						</li>
						<li>
							Uses <code>PublicKeyCredential</code> API
						</li>
						<li>Requires HTTPS or localhost</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
