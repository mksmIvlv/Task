using AI.Api;
using AI.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiExtensions();
builder.Services.AddApplicationExtensions();
builder.Services.AddInfrastructureExtensions();

var app = builder.Build();


// В dev-режиме
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API v1");
    });
}

// Редирект на Swagger по умолчанию
app.MapGet("/", context =>
{
    context.Response.Redirect("/swagger");
    return Task.CompletedTask;
});

app.UseCors("DevCorsPolicy");
app.MapControllers();
app.UseHttpsRedirection();
app.MapHub<HubSignalR>("/hubSignalR");


app.Run();
