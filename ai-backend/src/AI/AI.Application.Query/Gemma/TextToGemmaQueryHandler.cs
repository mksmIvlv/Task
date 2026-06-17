using AI.Application.Abstrations.Interfaces;
using AI.Business.Query.Abstractions.Gemma.Models;
using AI.Domain.Gemma.Models;
using MediatR;

namespace AI.Business.Query.Gemma;

public class TextToGemmaQueryHandler(IClient client): IRequestHandler<TextToGemmaQuery, GemmaTextResponseAI>
{
    public async Task<GemmaTextResponseAI> Handle(TextToGemmaQuery request, CancellationToken cancellationToken)
    {
        var ollamaRequest = new 
        {
            Model = "gemma:7b",
            Prompt = request.TextQuery,
            Stream = false
        };
        
        var text = await client.PostRequestAsync("http://localhost:11434/api/generate", request.TextQuery, "gemma:7b");

        return new GemmaTextResponseAI { Body = text };
    }
}