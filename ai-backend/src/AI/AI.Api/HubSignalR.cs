using AI.Business.Query.Abstractions.Gemma.Models;
using AI.Dto;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace AI.Api;

public class HubSignalR (IMediator mediator) : Hub
{
    public async IAsyncEnumerable<TextDto> SendTextQueryAsync(TextDto query, CancellationToken cancellationToken)
    {
        var streamQuery = new TextToGemmaQuery(query.Text);
        var stream = mediator.CreateStream(streamQuery, cancellationToken);

        await foreach (var data in stream.WithCancellation(cancellationToken))
        {
            yield return new TextDto { Text = data };
        }
    }
}