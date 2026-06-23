namespace AI.Api.Extensions;

public static class ApiExtensions
{
    public static IServiceCollection AddApiExtensions(this IServiceCollection services)
    {
        services.AddOpenApi();
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSignalR();

        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new() { Title = "AI API", Version = "v1" });
        });

        services.AddCors(options =>
        {
            options.AddPolicy("DevCorsPolicy", policy =>
            {
                policy.WithOrigins("http://localhost:4200", "http://localhost:55300")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
        
        return services;
    }
}