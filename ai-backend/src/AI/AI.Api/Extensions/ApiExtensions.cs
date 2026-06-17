namespace AI.Api.Extensions;

public static class ApiExtensions
{
    public static IServiceCollection AddApiExtensions(this IServiceCollection services)
    {
        services.AddOpenApi();
        services.AddControllers();
        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new() { Title = "AI API", Version = "v1" });
        });

        services.AddCors(options =>
        {
            options.AddPolicy("AllowLocalhost5173", builder =>
                builder.WithOrigins("http://localhost:5173")
                    .AllowAnyMethod()
                    .AllowAnyHeader());
        });
        
        return services;
    }
}