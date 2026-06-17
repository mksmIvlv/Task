namespace AI.Application.Abstrations.Interfaces;

public interface IClient
{
    Task<string> PostRequestAsync(string uri, string promt, string modelLlm);
}