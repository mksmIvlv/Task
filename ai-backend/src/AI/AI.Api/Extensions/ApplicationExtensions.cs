using AI.Application;
using AI.Application.Abstrations.Interfaces;
using AI.Business.Query.Gemma;
using MediatR;

namespace AI.Api.Extensions;

public static class ApplicationExtensions
{
    public static IServiceCollection AddApplicationExtensions(this IServiceCollection services)
    {
        services.AddMediatR(typeof(TextToGemmaQueryHandler).Assembly);
        services.AddSingleton<IClient, Client>();
        
        return services;
    }
}