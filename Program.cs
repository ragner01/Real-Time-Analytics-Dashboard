using Real_Time_Analytics_Dashboard.Hubs;
using Real_Time_Analytics_Dashboard.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Real-Time Analytics Dashboard API",
        Version = "v1",
        Description = "Interactive Business Intelligence Dashboard with Real-time Analytics, Custom Reports, and Predictive Analytics"
    });
});


// Configure MongoDB options
builder.Services.Configure<MongoOptions>(builder.Configuration.GetSection("MongoDB"));

// Dependency Injection
builder.Services.AddSingleton<MongoService>();
builder.Services.AddSingleton<MetricService>();
builder.Services.AddSingleton<DashboardService>();
builder.Services.AddSingleton<ReportService>();
builder.Services.AddSingleton<PredictionService>();

// SignalR for real-time updates
builder.Services.AddSignalR();

// CORS (allow your React dev server origins)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddPolicy("frontend", p =>
{
    p.WithOrigins(allowedOrigins)
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials();
}));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Real-Time Analytics Dashboard API V1");
        c.DocumentTitle = "Real-Time Analytics Dashboard API";
    });
}

app.UseHttpsRedirection();
app.UseCors("frontend");
app.UseAuthorization();

app.MapControllers();
app.MapHub<AnalyticsHub>("/hub/analytics");

app.Run();
