import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import CodeBlock from '#/components/uix/CodeBlock/client.tsx';

/**
 * TanStack Start Server Route Handler 类型说明
 *
 * @see https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
 *
 * handler 函数签名:
 * type ServerHandler = (args: {
 *   request: Request;      // Web Request 对象
 *   params: Record<string, string>;  // 动态路由参数，如 /users/$id → { id: '123' }
 *   context: TContext;    // 中间件传递的上下文
 * }) => Response | Promise<Response>
 *
 * 注意：这是用户自己定义的类型签名，不是官方导出的类型
 * 实际参数取决于你配置的 middleware 和 Register 类型
 */

/**
 * XHR 上传示例
 *
 * 功能：
 * 1. 接收 multipart/form-data 请求
 * 2. 打印上传文件的元信息（不存储）
 *
 * 关键点：
 * - 使用 request.formData() 获取文件（标准 Web API，兼容任何运行时）
 */
const uploadFile = async ({ request }: { request: Request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;

	if (!file) {
		return new Response(JSON.stringify({ error: 'No file provided' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	console.log('[XHR Upload] 收到文件:', {
		name: file.name,
		size: file.size,
		type: file.type,
		lastModified: new Date(file.lastModified).toISOString(),
	});

	return new Response(
		JSON.stringify({
			success: true,
			message: `文件 ${file.name} (${file.size} bytes) 已收到`,
		}),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		},
	);
};

export const Route = createFileRoute('/base/http/xhr')({
	server: {
		handlers: {
			PUT: async ({ request }) => await uploadFile({ request }),
		},
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-4 max-w-4xl mx-auto space-y-8">
			<h1 className="text-2xl font-bold">XMLHttpRequest (XHR) 上传示例</h1>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">1. XHR 基础用法</h2>
				<CodeBlock
					language="ts"
					code={`/**
 * 简单的 XHR GET 请求
 */
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data', true);

xhr.onload = function () {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log('响应数据:', data);
  } else {
    console.error('请求失败:', xhr.status);
  }
};

xhr.onerror = function () {
  console.error('网络错误');
};

xhr.send();`}
				/>
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">2. 带进度条的 XHR 上传</h2>
				<p className="text-sm text-muted-foreground">
					XHR 独有的优势：可以通过 upload.onprogress
					监听上传进度，这在文件上传场景非常有用
				</p>
				<CodeBlock
					language="ts"
					code={`/**
 * XHR 文件上传（带进度）
 * 关键点：
 * - xhr.upload.onprogress 可以监听上传进度
 * - xhr.onprogress 可以监听下载进度
 */
function uploadWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // 打开请求
    xhr.open('POST', '/base/http/xhr', true);
    
    // 上传进度（这是 XHR 独有的功能！）
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent, e.loaded, e.total);
      }
    };
    
    // 请求完成
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('上传失败: ' + xhr.status));
      }
    };
    
    // 网络错误
    xhr.onerror = function () {
      reject(new Error('网络错误'));
    };
    
    // 发送 FormData
    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}`}
				/>
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">3. 运行示例</h2>
				<XhrUploadDemo />
			</section>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold">4. 完整代码</h2>
				<CodeBlock
					language="tsx"
					code={`import { useRef, useState } from 'react';

function XhrUploadDemo() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleUpload = () => {
    if (!selectedFile) return;
    
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', '/base/http/xhr', true);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        setStatus('✅ ' + res.message);
      } else {
        setStatus('❌ 上传失败');
      }
    };
    
    xhr.onerror = () => {
      setStatus('❌ 网络错误');
    };
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    xhr.send(formData);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* 文件选择 */}
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => setSelectedFile(e.target.files?.[0])}
        className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground"
      />
      
      {/* 上传按钮 */}
      <button onClick={handleUpload} disabled={!selectedFile}>
        上传
      </button>
      
      {/* 进度条 */}
      {progress > 0 && (
        <div className="w-full h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-500 rounded transition-all"
            style={{ width: progress + '%' }}
          />
        </div>
      )}
      
      {/* 状态 */}
      {status && <p>{status}</p>}
    </div>
  );
}`}
				/>
			</section>
		</div>
	);
}

function XhrUploadDemo() {
	const [progress, setProgress] = useState(0);
	const [status, setStatus] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [result, setResult] = useState<string>('');

	const handleUpload = () => {
		if (!selectedFile) return;

		setProgress(0);
		setStatus('上传中...');
		setResult('');

		const xhr = new XMLHttpRequest();

		xhr.open('PUT', '/base/http/xhr', true);

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) {
				const percent = Math.round((e.loaded / e.total) * 100);
				setProgress(percent);
			}
		};

		xhr.onload = () => {
			if (xhr.status === 200) {
				const res = JSON.parse(xhr.responseText);
				setStatus('✅ 上传完成');
				setResult(JSON.stringify(res, null, 2));
			} else {
				setStatus(`❌ 上传失败: ${xhr.status}`);
			}
		};

		xhr.onerror = (ev) => {
			setStatus('❌ 网络错误');
		};

		const formData = new FormData();
		formData.append('file', selectedFile);
		xhr.send(formData);
	};

	return (
		<div className="space-y-4 p-4 border rounded-lg">
			<input
				type="file"
				onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
				className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
			/>

			{selectedFile && (
				<p className="text-sm">
					已选择: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}{' '}
					KB)
				</p>
			)}

			<button
				onClick={handleUpload}
				disabled={!selectedFile}
				className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
			>
				上传
			</button>

			{progress > 0 && (
				<div className="space-y-1">
					<div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
						<div
							className="h-2 bg-blue-500 transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<p className="text-sm text-muted-foreground">{progress}%</p>
				</div>
			)}

			{status && (
				<p
					className={
						status.includes('✅')
							? 'text-green-600'
							: status.includes('❌')
								? 'text-red-600'
								: ''
					}
				>
					{status}
				</p>
			)}

			{result && (
				<div className="p-3 bg-muted rounded text-sm font-mono">
					<pre>{result}</pre>
				</div>
			)}
		</div>
	);
}
