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
    
    public async Task<string> PostRequestAsync(string uri, string promt, string modelLlm)
    {
        var requestBody = new
        {
            model = modelLlm,
            prompt = promt
        };
        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await client.PostAsync(uri, content);
        var allText = await response.Content.ReadAsStringAsync();
        var fullText = new StringBuilder();

        foreach (var line in allText.Split('\n'))
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            using var doc = JsonDocument.Parse(line);
            if (doc.RootElement.TryGetProperty("response", out var resp))
            {
                fullText.Append(resp.GetString());
            }
        }

        return fullText.ToString();
    }
}