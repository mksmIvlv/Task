using AI.Domain.Gemma.Models;
using MediatR;

namespace AI.Business.Query.Abstractions.Gemma.Models;

public record TextToGemmaQuery(string TextQuery) : IRequest<GemmaTextResponseAI>;