using AI.Application.Abstrations.Interfaces;
using AI.Business.Query.Abstractions.Gemma.Models;
using MediatR;

namespace AI.Business.Query.Gemma;

public class TextToGemmaQueryHandler(IClient client) : IStreamRequestHandler<TextToGemmaQuery, string>
{
    public IAsyncEnumerable<string> Handle(TextToGemmaQuery request, CancellationToken cancellationToken)
    {
        return client.PostRequestAsync("http://localhost:11434/api/generate", request.TextQuery, "gemma:7b", cancellationToken);
    }
}