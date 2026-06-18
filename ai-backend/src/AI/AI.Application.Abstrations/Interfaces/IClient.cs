namespace AI.Application.Abstrations.Interfaces;

public interface IClient
{
    IAsyncEnumerable<string> PostRequestAsync(string uri, string promt, string modelLlm, CancellationToken cancellationToken);
}