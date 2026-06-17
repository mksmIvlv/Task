using AI.Domain.Base;

namespace AI.Domain.Gemma.Models;

public record GemmaGemmaTextRequestAI : IBaseModel<string>
{
    public int Id { get; set; }

    public string Body { get; set; }
}