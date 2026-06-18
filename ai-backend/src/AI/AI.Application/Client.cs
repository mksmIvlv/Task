using System.Text;
using System.Text.Json;
using AI.Application.Abstrations.Interfaces;

namespace AI.Application;

public class Client : IClient
{
    private readonly HttpClient client;

    public Client()
    {
        client = new HttpClient();
    }
    
    public async IAsyncEnumerable<string> PostRequestAsync(string uri, string prompt, string modelLlm, CancellationToken cancellationToken)
    {
        var requestBody = new
        {
            model = modelLlm, 
            prompt = prompt, 
            stream = true
        };
        using var request = new HttpRequestMessage(HttpMethod.Post, uri);
        request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();
        
        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream, Encoding.UTF8);

        while (!reader.EndOfStream)
        {
            cancellationToken.ThrowIfCancellationRequested();

            string line = await reader.ReadLineAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }
            
            using var json = JsonDocument.Parse(line);
            if (json.RootElement.TryGetProperty("response", out var resp))
            {
                string data = resp.GetString();
                if (!string.IsNullOrEmpty(data))
                {
                    yield return data; 
                }
            }
        }
    }
}