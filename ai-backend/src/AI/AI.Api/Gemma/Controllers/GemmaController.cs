using System.Text.Json;
using AI.Business.Query.Abstractions.Gemma.Models;
using AI.Dto;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AI.Api.Gemma.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GemmaController(IMediator mediator) : Controller
{
    [HttpPost("sendTextQuery")]
    public async Task SendTextQueryAsync(TextDto query, CancellationToken cancellationToken)
    {
        Response.ContentType = "text/event-stream";
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");
        
        try
        {
            var streamQuery = new TextToGemmaQuery(query.Text);
            var stream = mediator.CreateStream(streamQuery, cancellationToken);

            await foreach (var data in stream)
            {
                // JSON-строка формата SSE: "data: {...}\n\n"
                var sseMessage = $"data: {JsonSerializer.Serialize(new { text = data })}\n\n";
                await Response.WriteAsync(sseMessage, cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
        catch (Exception ex)
        {
            // ошибка в формате SSE
            await Response.WriteAsync($"data: {JsonSerializer.Serialize(new { error = ex.Message })}\n\n", cancellationToken);
        }
    }
}