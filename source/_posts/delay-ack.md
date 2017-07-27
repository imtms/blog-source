---
title: Linux下TCP延迟确认(Delay ACK)机制
date: 2017-05-15 15:18:17
categories: By TMs
tags: [linux]
---
本文的起因是周师傅早上突然问起为何本应四次挥手的TCP，抓包发现只有三个包，看图显示为客户端主动发送FIN的情况下，少了一个服务器对客户端的ACK回复，而是直接发送了FIN+ACK。

此时我还不知道是因为Linux的Delay ACK机制造成的。于是针对这个现象展开了一波研究。

首先找到定义TCP协议的RFC793的文档 https://tools.ietf.org/html/rfc793 的3.5部分，文档表示
    
         TCP A                                                TCP B
    
      1.  ESTABLISHED                                          ESTABLISHED
    
      2.  (Close)
          FIN-WAIT-1  --> <SEQ=100><ACK=300><CTL=FIN,ACK>  --> CLOSE-WAIT
    
      3.  FIN-WAIT-2  <-- <SEQ=300><ACK=101><CTL=ACK>      <-- CLOSE-WAIT
    
      4.                                                       (Close)
          TIME-WAIT   <-- <SEQ=300><ACK=101><CTL=FIN,ACK>  <-- LAST-ACK
    
      5.  TIME-WAIT   --> <SEQ=101><ACK=301><CTL=ACK>      --> CLOSED
    
      6.  (2 MSL)
          CLOSED
    
                             Normal Close Sequence
    
                                   Figure 13.

    
    
          TCP A                                                TCP B
    
      1.  ESTABLISHED                                          ESTABLISHED
    
      2.  (Close)                                              (Close)
          FIN-WAIT-1  --> <SEQ=100><ACK=300><CTL=FIN,ACK>  ... FIN-WAIT-1
                      <-- <SEQ=300><ACK=100><CTL=FIN,ACK>  <--
                      ... <SEQ=100><ACK=300><CTL=FIN,ACK>  -->
    
      3.  CLOSING     --> <SEQ=101><ACK=301><CTL=ACK>      ... CLOSING
                      <-- <SEQ=301><ACK=101><CTL=ACK>      <--
                      ... <SEQ=101><ACK=301><CTL=ACK>      -->
    
      4.  TIME-WAIT                                            TIME-WAIT
          (2 MSL)                                              (2 MSL)
          CLOSED                                               CLOSED
    
                          Simultaneous Close Sequence

显然不管是单方发起还是双方同时发起关闭连接，都是有四次挥手的。

只好从源代码下手去寻找答案。由于周师傅抓包的是HTTP的情况，于是从服务器端的nginx源码研究起。
nginx/src/os/unix/ngx_socket.h里显示
>  ioctl(FIONBIO) sets a non-blocking mode with the single syscall
 while fcntl(F_SETFL, O_NONBLOCK) needs to learn the current state
 using fcntl(F_GETFL).
  ioctl() and fcntl() are syscalls at least in FreeBSD 2.x, Linux 2.2
 and Solaris 7.
  ioctl() in Linux 2.4 and 2.6 uses BKL, however, fcntl(F_SETFL) uses it too.
 
nginx是使用系统函数来管理TCP连接的。所以这不是nginx的锅，于是找到Linux内核源码来研究系统对TCP的管理。

首先找到linux/net/ipv4/tcp.c来观察系统对于TCP_ESTABLISHED时收到FIN包如何切换状态。
在tcp_set_state函数中找到了linux对tcp状态的变化维护表


    static const unsigned char new_state[16] = {
      /* current state:        new state:      action:    */
      [0 /* (Invalid) */]	= TCP_CLOSE,
      [TCP_ESTABLISHED]	= TCP_FIN_WAIT1 | TCP_ACTION_FIN,
      [TCP_SYN_SENT]	= TCP_CLOSE,
      [TCP_SYN_RECV]	= TCP_FIN_WAIT1 | TCP_ACTION_FIN,
      [TCP_FIN_WAIT1]	= TCP_FIN_WAIT1,
      [TCP_FIN_WAIT2]	= TCP_FIN_WAIT2,
      [TCP_TIME_WAIT]	= TCP_CLOSE,
      [TCP_CLOSE]		= TCP_CLOSE,
      [TCP_CLOSE_WAIT]	= TCP_LAST_ACK  | TCP_ACTION_FIN,
      [TCP_LAST_ACK]	= TCP_LAST_ACK,
      [TCP_LISTEN]		= TCP_CLOSE,
      [TCP_CLOSING]		= TCP_CLOSING,
      [TCP_NEW_SYN_RECV]	= TCP_CLOSE,	/* should not happen ! */
    };

而对FIN包的处理是由linux/net/ipv4/tcp_input.c里面的tcp_fin函数负责


    /*
     * 	Process the FIN bit. This now behaves as it is supposed to work
     *	and the FIN takes effect when it is validly part of sequence
     *	space. Not before when we get holes.
     *
     *	If we are ESTABLISHED, a received fin moves us to CLOSE-WAIT
     *	(and thence onto LAST-ACK and finally, CLOSE, we never enter
     *	TIME-WAIT)
     *
     *	If we are in FINWAIT-1, a received FIN indicates simultaneous
     *	close and we go into CLOSING (and later onto TIME-WAIT)
     *
     *	If we are in FINWAIT-2, a received FIN moves us to TIME-WAIT.
     */


    void tcp_fin(struct sock *sk)
    {
    	struct tcp_sock *tp = tcp_sk(sk);
    
    	inet_csk_schedule_ack(sk);
    
    	sk->sk_shutdown |= RCV_SHUTDOWN;
    	sock_set_flag(sk, SOCK_DONE);
    
    	switch (sk->sk_state) {
    	case TCP_SYN_RECV:
    	case TCP_ESTABLISHED:
    		/* Move to CLOSE_WAIT */
    		tcp_set_state(sk, TCP_CLOSE_WAIT);
    		inet_csk(sk)->icsk_ack.pingpong = 1;
    		break;
    
    	case TCP_CLOSE_WAIT:
    	case TCP_CLOSING:
    		/* Received a retransmission of the FIN, do
    		 * nothing.
    		 */
    		break;
    	case TCP_LAST_ACK:
    		/* RFC793: Remain in the LAST-ACK state. */
    		break;
    
    	case TCP_FIN_WAIT1:
    		/* This case occurs when a simultaneous close
    		 * happens, we must ack the received FIN and
    		 * enter the CLOSING state.
    		 */
    		tcp_send_ack(sk);
    		tcp_set_state(sk, TCP_CLOSING);
    		break;
    	case TCP_FIN_WAIT2:
    		/* Received a FIN -- send ACK and enter TIME_WAIT. */
    		tcp_send_ack(sk);
    		tcp_time_wait(sk, TCP_TIME_WAIT, 0);
    		break;
    	default:
    		/* Only TCP_LISTEN and TCP_CLOSE are left, in these
    		 * cases we should never reach this piece of code.
    		 */
    		pr_err("%s: Impossible, sk->sk_state=%d\n",
    		       __func__, sk->sk_state);
    		break;
    	}
    
    	/* It _is_ possible, that we have something out-of-order _after_ FIN.
    	 * Probably, we should reset in this case. For now drop them.
    	 */
    	skb_rbtree_purge(&tp->out_of_order_queue);
    	if (tcp_is_sack(tp))
    		tcp_sack_reset(&tp->rx_opt);
    	sk_mem_reclaim(sk);
    
    	if (!sock_flag(sk, SOCK_DEAD)) {
    		sk->sk_state_change(sk);
    
    		/* Do not send POLL_HUP for half duplex close. */
    		if (sk->sk_shutdown == SHUTDOWN_MASK ||
    		    sk->sk_state == TCP_CLOSE)
    			sk_wake_async(sk, SOCK_WAKE_WAITD, POLL_HUP);
    		else
    			sk_wake_async(sk, SOCK_WAKE_WAITD, POLL_IN);
    	}
    }

函数做了状态转换和乱序包的处理。而在TCP_ESTABLISHED这里发现一个有趣的现象，没有马上调用tcp_send_ack进行ACK回复，而是执行了
`inet_csk(sk)->icsk_ack.pingpong = 1;`
这个icsk_ack.pingpong是什么呢，顺藤摸瓜的找到了include/net/inet_connection_sock.h


    
    @icsk_ack: Delayed ACK control data
    
    	struct {
    		__u8		  pending;	 /* ACK is pending			   */
    		__u8		  quick;	 /* Scheduled number of quick acks	   */
    		__u8		  pingpong;	 /* The session is interactive		   */
    		__u8		  blocked;	 /* Delayed ACK was blocked by socket lock */
    		__u32		  ato;		 /* Predicted tick of soft clock	   */
    		unsigned long	  timeout;	 /* Currently scheduled timeout		   */
    		__u32		  lrcvtime;	 /* timestamp of last received data packet */
    		__u16		  last_seg_size; /* Size of last incoming segment	   */
    		__u16		  rcv_mss;	 /* MSS used for delayed ACK decisions	   */ 
    
其中pingpong的作用是表明这个session是交互式。这个标志位是delay ack的一个control位。查阅了一下icsk_ack.pingpong和delay ack的资料，发现正常的挥手流程是这样的

1. client: FIN  (will not send more) 
2. server: ACK (received the FIN)
.. server: sends more data..., client ACKs these data 
3. server: FIN (will not send more)
4. client: ACK (received the FIN)

而下面有说

> If the server has no more data to send it might close the connection also. In this case steps 2+3 can be merged, e.g. the server sends a FIN+ACK, where the ACK acknowledges the FIN received by the client.

也就是说如果服务器端在客户端发出FIN以后，如果有数据要发送，需要先ACK这个FIN，然后再进行数据发送。但是如果服务器端没有更多数据发送，也要关闭连接的情况下，很可能ACK包就跟随FIN一起发出。其中ACK为确认客户端的FIN包。

查询RFC1122的 4.2.3.2  When to Send an ACK Segment 得知


             4.2.3.2  When to Send an ACK Segment
                A host that is receiving a stream of TCP data segments can
                increase efficiency in both the Internet and the hosts by
                sending fewer than one ACK (acknowledgment) segment per data
                segment received; this is known as a "delayed ACK" [TCP:5].
    
                A TCP SHOULD implement a delayed ACK, but an ACK should not
                be excessively delayed; in particular, the delay MUST be
                less than 0.5 seconds, and in a stream of full-sized
                segments there SHOULD be an ACK for at least every second
                segment.

原来：
TCP采用两种方式来发送ACK：快速确认和延迟确认。
在快速确认模式中，本端接收到数据包后，会立即发送ACK给对端。
在延迟确认模式中，本端接收到数据包后，不会立即发送ACK给对端，而是等待一段时间，如果在此期间：
1. 本端有数据包要发送给对端。就在发送数据包的时候捎带上此ACK，如此一来就节省了一个报文。
2. 本端没有数据包要发送给对端。延迟确认定时器会超时，然后发送纯ACK给对端。

具体实现上面用
icsk->icsk_ack.pingpong == 0，表示使用快速确认。
icsk->icsk_ack.pingpong == 1，表示使用延迟确认。
而对周师傅遇到的情况的FIN包的处理刚好是在icsk->icsk_ack.pingpong == 1的场景。于是服务端的FIN和ACK合并发送了。

参考资料：
https://github.com/torvalds/linux/
http://blog.csdn.net/wdscq1234/article/details/52430382
http://blog.csdn.net/dog250/article/details/52664508
http://stackoverflow.com/questions/21390479/fin-omitted-fin-ack-sent