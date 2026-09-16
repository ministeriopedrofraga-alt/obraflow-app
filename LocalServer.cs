using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

public static class LocalServer
{
    private static string root;
    private static readonly Dictionary<string, string> Mime = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { ".html", "text/html; charset=utf-8" },
        { ".css", "text/css; charset=utf-8" },
        { ".js", "application/javascript; charset=utf-8" },
        { ".json", "application/json; charset=utf-8" },
        { ".svg", "image/svg+xml" },
        { ".png", "image/png" },
        { ".ico", "image/x-icon" }
    };

    public static void Main(string[] args)
    {
        int port = args.Length > 0 ? int.Parse(args[0]) : 4173;
        root = Path.GetFullPath(AppDomain.CurrentDomain.BaseDirectory);
        TcpListener listener = new TcpListener(IPAddress.Loopback, port);
        listener.Start();
        Console.WriteLine("ObraFlow disponível em http://localhost:" + port + "/");

        while (true)
        {
            TcpClient client = listener.AcceptTcpClient();
            ThreadPool.QueueUserWorkItem(HandleClient, client);
        }
    }

    private static void HandleClient(object state)
    {
        using (TcpClient client = (TcpClient)state)
        using (NetworkStream stream = client.GetStream())
        using (StreamReader reader = new StreamReader(stream, Encoding.ASCII, false, 1024, true))
        {
            try
            {
                string requestLine = reader.ReadLine();
                if (String.IsNullOrEmpty(requestLine)) return;
                string[] parts = requestLine.Split(' ');
                if (parts.Length < 2 || parts[0] != "GET") { SendStatus(stream, 405, "Method Not Allowed"); return; }

                string urlPath = Uri.UnescapeDataString(parts[1].Split('?')[0]).TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                if (String.IsNullOrEmpty(urlPath)) urlPath = "index.html";
                string filePath = Path.GetFullPath(Path.Combine(root, urlPath));

                if (!filePath.StartsWith(root, StringComparison.OrdinalIgnoreCase)) { SendStatus(stream, 403, "Forbidden"); return; }
                if (!File.Exists(filePath)) { SendStatus(stream, 404, "Not Found"); return; }

                byte[] body = File.ReadAllBytes(filePath);
                string extension = Path.GetExtension(filePath);
                string contentType;
                if (!Mime.TryGetValue(extension, out contentType)) contentType = "application/octet-stream";
                byte[] header = Encoding.ASCII.GetBytes("HTTP/1.1 200 OK\r\nContent-Type: " + contentType + "\r\nContent-Length: " + body.Length + "\r\nCache-Control: no-cache\r\nConnection: close\r\n\r\n");
                stream.Write(header, 0, header.Length);
                stream.Write(body, 0, body.Length);
            }
            catch { }
        }
    }

    private static void SendStatus(NetworkStream stream, int status, string message)
    {
        byte[] body = Encoding.UTF8.GetBytes(message);
        byte[] header = Encoding.ASCII.GetBytes("HTTP/1.1 " + status + " " + message + "\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: " + body.Length + "\r\nConnection: close\r\n\r\n");
        stream.Write(header, 0, header.Length);
        stream.Write(body, 0, body.Length);
    }
}
