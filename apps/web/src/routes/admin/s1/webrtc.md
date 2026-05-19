WebRTC 的通信过程可以用一句话概括：**在去中心化的网络世界中，两台原本互不相识的设备，通过一个中间人“对暗号”，最终在彼此之间拉起一条私密专属的通信管道。** 

因为绝大多数设备都躲在路由器或防火墙后面（局域网），无法直接通过公网 IP 访问，所以 WebRTC 的建立过程非常严密。下面我们一步步拆解从“点击通话”到“视频画面亮起”的完整技术细节： 
## 🚀 核心准备：三大服务器角色 在通信开始前，我们必须了解三个在背后默默支撑的服务器角色。
**WebRTC 虽然是点对点（P2P）通信，但在连接建立成功之前，绝对离不开服务器的协助。** 
* **信令服务器（Signaling Server）**：红娘/中介。负责帮两个浏览器传递“名片（SDP）”和“网络地址（ICE）”。它通常基于 WebSocket 或 HTTP 建立。 
* **STUN 服务器**：照镜子。告诉浏览器：“你在公网上的真实 IP 和端口是什么”。 
* **TURN 服务器**：强力中转站。如果两端网络实在太严格（比如对称型 NAT），怎么都打不通洞，就由它来负责转发所有音视频流量（兜底方案方案，会消耗服务器带宽）。 
## 🔄 WebRTC 通信的六个详细步骤 
假设通信的两端分别是 **发起方 A (Offer 端)** 和 **接收方 B (Answer 端)**。 
### 第一步：获取本地媒体流 (Media Capture) 在做任何通信之前，A 和 B 需要先拿到自己的音视频数据。 
* **细节**：浏览器调用 navigator.mediaDevices.getUserMedia({ video: true, audio: true }) 弹出权限提示。
* **底层**：用户允许后，浏览器会获取摄像头和麦克风的硬件输入，并将其封装为一个 MediaStream（媒体流）对象。随后，这个流会被绑定到本地的 <video> 标签上，让用户看到自己的画面。 
### 第二步：创建 PeerConnection 与生成 Offer (SDP) A 点击“呼叫”，开始初始化通信引擎。 
* **细节**：A 创建一个核心对象 new RTCPeerConnection(config)（配置里包含了 STUN/TURN 的地址）。接着，A 把刚才拿到的 MediaStream 里的轨道（Tracks）添加到这个连接对象中。 
* **生成 Offer**：A 调用 peerConnection.createOffer()，浏览器会生成一段文本，叫做 **SDP (Session Description Protocol，会话描述协议)**。 
* **SDP 里有什么**：它就像一张详细的设备名片，记录了 A 支持哪些音视频编码（如 VP8/H.264）、音频采样率、加密算法、以及准备传输什么媒体内容。 
### 第三步：设置本地并发送信令 (Local Description & Signaling) A 拿到了 Offer，但此时通信还没真正开始。 
* **内部设置**：A 调用 peerConnection.setLocalDescription(offer)，让自己浏览器底层的 WebRTC 引擎进入“等待连接”的状态。 
* **信令发出**：A 通过 WebSocket 等渠道，将这个 Offer SDP 文本打包发送给**信令服务器**，并指明要传给 B。 
### 第四步：B 接收 Offer 并回应 Answer B 在另一端监听信令服务器。 
* **收到 Offer**：B 的浏览器收到 A 发来的 Offer SDP。 
* **设置远端**：B 调用 peerConnection.setRemoteDescription(offer)。此时，B 的 WebRTC 引擎就知道了 A 的所有底细（比如 A 想发视频，A 支持 H.264 等）。 
* **生成 Answer**：B 同样获取自己的摄像头，把流加入连接，然后调用 peerConnection.createAnswer() 生成自己的名片 —— **Answer SDP**。 
* **双向锁定**：B 调用 setLocalDescription(answer) 锁定自己的状态，并通过信令服务器把 Answer SDP 传回给 A。A 收到后，调用 setRemoteDescription(answer)。 
* **此时状态**：**双方已经对好了暗号（媒体格式协商完成）**，但依然不知道对方的网络地址，无法直接传数据。 
### 第五步：ICE 候选者收集与网络打洞 (ICE Candidate Gathering) 这一步通常与第三、四步**同时/交叉进行**。
只要 RTCPeerConnection 启动，浏览器底层就会开始疯狂收集自己的网络地址。 
1. **向 STUN 询问**：A 和 B 的浏览器分别向配置好的 **STUN 服务器** 发送 UDP 探测包。STUN 服务器收到后，看一眼来包的公网 IP 和端口，然后回信告诉浏览器：“这就是你在外网的家门牌号”。 
2. **生成 Candidate**：浏览器把收集到的本地局域网 IP、公网 IP、TURN 中转 IP 等全部打包，每一个可能的组合都叫一个 **ICE Candidate（网络候选者）**。 
3. **实时交换**：一旦有新的 Candidate 被生成，A 的浏览器就会触发 onicecandidate 事件。A 立即通过信令服务器把这个 Candidate 发送给 B；B 收到后调用 addIceCandidate()。反之 B 也是一样。 
### 第六步：连通性测试与 P2P 管道建立 (Connection Establishment) 现在两端手上都有了对方的一堆 IP 地址（Candidates）。 
* **网络打洞（STUN 穿透）**：WebRTC 底层会把这些地址两两配对，开始疯狂互相发送测试包（STUN 绑定请求），尝试刺穿对方的防火墙和路由器（NAT）。 
* **确定最优路径**：如果双方都是普通的家用宽带，打洞通常会成功。它们会挑出一条**延迟最低、最稳定**的公网直接通道。 
* **TURN 兜底**：如果双方都在严格的公司企业网防火墙内，打洞全部失败，WebRTC 会自动切换路径，让两端都连接到 **TURN 服务器**，由 TURN 进行流量中转。 
* **握手与加密**：通道连通后，两端会立即进行 **DTLS/SRTP 握手**，为这条通道加上军工级的加密锁，防止通话被窃听。 
## 🎉 终点：画面亮起 当 P2P 管道彻底打通并加密成功后： 
1. B 的浏览器会触发 ontrack 事件（检测到有远端音视频流进来了）。 
2. 在 ontrack 的回调函数中，B 拿到 A 的 MediaStream，并将其赋值给网页上的 <video srcObject={stream}>。 
3. **视频画面瞬间在网页上显示出来，低延迟的实时通话正式开始。** 整个看似复杂的六步流程，在优秀的网络环境下，通常在 **0.5 到 2 秒** 内就会全部悄悄完成。