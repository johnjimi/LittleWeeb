using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

namespace LittleWeeb
{
    
    class ThreadInfo
    {
        public NetworkStream stream { get; set; }
        public TcpClient client { get; set; }
    }

    public class WebSocketEventArgs : EventArgs
    {
        public string Message { get; set; }
    }

    public class SimpleWebSockets
    {
        private Thread runServer = null;
        private ConcurrentDictionary<int, string> message = new ConcurrentDictionary<int, string>();
        private int port = 8000;
        private int globalMessageCount = 0;
        private bool needtoshutdown = false;
        public SimpleWebSockets()
        {
            if (runServer != null)
            {
                runServer.Abort();
            }
            message = new ConcurrentDictionary<int, string>();
        }

        public SimpleWebSockets(int port)
        {
            if (runServer != null)
            {
                runServer.Abort();
            }
            this.port = port;
            message = new ConcurrentDictionary<int, string>();
        }

        public void SendGlobalMessage(string message)
        {
            DebugRec("SENDING MESSAGE: " + message);
            this.message.TryAdd(this.message.Count(), message);
        }

        public void Start()
        {
            needtoshutdown = false;
            runServer = new Thread(new ThreadStart(RunServer));
            runServer.Start();
        }

        public void Stop()
        {
            needtoshutdown = true;
        }

        private void RunServer()
        {

            try
            {
                TcpListener tcpListener = new TcpListener(IPAddress.Any, port);
                tcpListener.Start();

                byte[] bytes = new byte[1024];
                string data = "";
                string prevdata = "";

                while (!needtoshutdown)
                {

                    DebugRec("Awaiting connection...");
                    TcpClient client = tcpListener.AcceptTcpClient();
                    DebugRec("Connected!");
                    NetworkStream stream = client.GetStream();
                    DebugRec("Client: " + ((IPEndPoint)client.Client.RemoteEndPoint).Address.ToString());

                    int i = stream.Read(bytes, 0, bytes.Length);
                    data = Encoding.ASCII.GetString(bytes, 0, i);


                    if (data != prevdata)
                    {
                        if (data.Contains("Sec-WebSocket-Key:"))
                        {
                            string webSocketKey = data.Split(new string[] { "Sec-WebSocket-Key:" }, StringSplitOptions.None)[1].Split(new string[] { "\r\n" }, StringSplitOptions.None)[0].Trim();


                            string concatenatedKey = string.Concat(webSocketKey, "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
                            string hashedKey = Hash(concatenatedKey);

                            string headerToSendBack = "HTTP/1.1 101 Switching Protocols\r\n" + "Upgrade: websocket\r\n" + "Connection: Upgrade\r\n" + "Sec-WebSocket-Accept: " + hashedKey + "\r\n\r\n";

                            byte[] msg = Encoding.ASCII.GetBytes(headerToSendBack);

                            // Send back a response.
                            stream.Write(msg, 0, msg.Length);
                            ThreadInfo info = new ThreadInfo();
                            info.stream = stream;
                            info.client = client;
                            ThreadPool.QueueUserWorkItem(new WaitCallback(SimpleWebSocketsReceiveThread), info);

                        }
                        prevdata = data;
                    }


                }
                DebugRec("Stopped listening ");
            }
            catch (Exception e)
            {
                DebugRec("Couldn't start listening: " + e.ToString());
            }

        }

        private void SimpleWebSocketsReceiveThread(object t)
        {
            ThreadInfo info = t as ThreadInfo;
            NetworkStream stream = info.stream;
            TcpClient client = info.client;
            byte[] bytes = new byte[1024];
            string data = "";
            string prevdata = "";
            int messageCount = globalMessageCount;

            while (client.Connected && !needtoshutdown)
            {
                Thread.Sleep(1);
                if (stream.DataAvailable)
                {
                    int i = stream.Read(bytes, 0, bytes.Length);
                    uint a = (uint)bytes[1] & (uint)127;

                    byte[] c = new byte[4];

                    byte[] e = new byte[(int)a];

                    if (a == 126)
                    {
                        a = ((uint)bytes[2] << 8) | (uint)bytes[3];
                        e = new byte[(int)a];
                        Buffer.BlockCopy(bytes, 4, c, 0, 4);
                        Buffer.BlockCopy(bytes, 8, e, 0, (int)a);
                    }
                    else if (a == 127)
                    {
                        a = ((uint)bytes[2] << 56) + ((uint)bytes[3] << 48) | ((uint)bytes[4] << 40) | ((uint)bytes[5] << 32) | ((uint)bytes[6] << 24) | ((uint)bytes[7] << 16) | ((uint)bytes[8] << 8) | (uint)bytes[9];
                        e = new byte[(int)a];
                        Buffer.BlockCopy(bytes, 10, c, 0, 4);
                        Buffer.BlockCopy(bytes, 14, e, 0, (int)a);
                    }
                    else
                    {
                        e = new byte[(int)a];
                        Buffer.BlockCopy(bytes, 2, c, 0, 4);
                        Buffer.BlockCopy(bytes, 6, e, 0, (int)a);
                    }



                    var DECODED = "";
                    for (int d = 0; d < a; d++)
                    {
                        uint dec = (uint)e[d] ^ (uint)c[d % 4];
                        DECODED = DECODED + (char)dec;
                    }


                    data = DECODED;
                    if (data != prevdata)
                    {
                        MsgRec(data);
                        prevdata = data;
                        data = "";
                    }

                }

                int tries = 0;
                while (message.Count() != messageCount && !needtoshutdown)
                {
                    Thread.Sleep(10);
                    string msg = "";
                    message.TryGetValue(messageCount, out msg);
                    if (msg.Length > 0)
                    {

                        byte[] msgInBytes = Encoding.UTF8.GetBytes(msg);
                        uint amountBytesToSend = (uint)msgInBytes.Length;
                        byte[] z = new byte[amountBytesToSend];
                        if (amountBytesToSend > 0 & amountBytesToSend < 125)
                        {
                            z = new byte[amountBytesToSend + 2];
                            Buffer.BlockCopy(msgInBytes, 0, z, 2, (int)amountBytesToSend);
                            z[0] = 129;
                            z[1] = (byte)amountBytesToSend;

                        }
                        else if (amountBytesToSend > 126 & amountBytesToSend < 65535)
                        {
                            z = new byte[amountBytesToSend + 4];
                            Buffer.BlockCopy(msgInBytes, 0, z, 4, (int)amountBytesToSend);
                            z[0] = 129;
                            z[1] = 126;
                            z[2] = (byte)((amountBytesToSend >> 8) & 255);
                            z[3] = (byte)((amountBytesToSend) & 255);

                        }
                        else
                        {
                            z = new byte[amountBytesToSend + 10];
                            Buffer.BlockCopy(msgInBytes, 0, z, 10, (int)amountBytesToSend);
                            z[0] = 129;
                            z[1] = 127;
                            z[2] = (byte)((amountBytesToSend >> 56) & 255);
                            z[3] = (byte)((amountBytesToSend >> 48) & 255);
                            z[4] = (byte)((amountBytesToSend >> 40) & 255);
                            z[5] = (byte)((amountBytesToSend >> 32) & 255);
                            z[6] = (byte)((amountBytesToSend >> 24) & 255);
                            z[7] = (byte)((amountBytesToSend >> 16) & 255);
                            z[8] = (byte)((amountBytesToSend >> 8) & 255);
                            z[9] = (byte)((amountBytesToSend) & 255);

                        }
                        try
                        {
                            if (stream.CanWrite)
                            {
                                stream.Write(z, 0, z.Length);
                                stream.Flush();

                                DebugRec("Written message to server of size: " + z.Length);

                                messageCount++;
                                globalMessageCount = messageCount;
                                tries = 0;
                            }
                        }
                        catch (Exception e)
                        {
                            DebugRec("Some kind of error while sending data: " + e.ToString());
                            tries++;
                            Thread.Sleep(100);
                            if(tries > 3)
                            {
                                break;
                            }
                        }
                    }
                }
                
            }
            DebugRec("Stopped listener ");
        }

        private string Hash(string input)
        {
            using (SHA1 sha1 = SHA1.Create())
            {
                byte[] hash = sha1.ComputeHash(Encoding.UTF8.GetBytes(input));

                return Convert.ToBase64String(hash);
            }
        }



        public event EventHandler<WebSocketEventArgs> MessageReceived;
        public event EventHandler<WebSocketEventArgs> DebugMessage;
        protected virtual void OnMessageReceived(WebSocketEventArgs e)
        {
            EventHandler<WebSocketEventArgs> handler = MessageReceived;
            if (handler != null)
            {
                handler(this, e);
            }
        }

        protected virtual void OnDebugMessage(WebSocketEventArgs e)
        {
            EventHandler<WebSocketEventArgs> handler = DebugMessage;
            if (handler != null)
            {
                handler(this, e);
            }
        }

        public void MsgRec(string msg)
        {
            WebSocketEventArgs args = new WebSocketEventArgs();
            args.Message = msg;
            OnMessageReceived(args);

        }
        public void DebugRec(string msg)
        {
            WebSocketEventArgs args = new WebSocketEventArgs();
            args.Message = msg;
            OnDebugMessage(args);
        }
    }
    
}
