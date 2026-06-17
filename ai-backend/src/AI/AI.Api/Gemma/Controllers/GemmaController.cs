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
    public async Task<IActionResult> SendTextQueryAsync(TextDto query)
    {
        var result = await mediator.Send(new TextToGemmaQuery(query.Text));
        return Ok(new { text = result.Body });
    }
}