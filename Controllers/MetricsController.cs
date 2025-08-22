using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Real_Time_Analytics_Dashboard.Hubs;
using Real_Time_Analytics_Dashboard.Models;
using Real_Time_Analytics_Dashboard.Services;

namespace Real_Time_Analytics_Dashboard.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetricsController : ControllerBase
{
    private readonly MetricService _service;
    private readonly IHubContext<AnalyticsHub> _hub;

    public MetricsController(MetricService service, IHubContext<AnalyticsHub> hub)
    {
        _service = service;
        _hub = hub;
    }

    [HttpGet("latest")]
    public async Task<ActionResult<IEnumerable<Metric>>> GetLatest([FromQuery] int limit = 50) =>
        Ok(await _service.GetLatestAsync(limit));

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<Metric>>> GetByCategory(string category, [FromQuery] int limit = 100) =>
        Ok(await _service.GetByCategoryAsync(category, limit));

    [HttpGet("timerange")]
    public async Task<ActionResult<IEnumerable<Metric>>> GetByTimeRange(
        [FromQuery] DateTime start, 
        [FromQuery] DateTime end, 
        [FromQuery] string? category = null) =>
        Ok(await _service.GetByTimeRangeAsync(start, end, category));

    [HttpGet("trending")]
    public async Task<ActionResult<IEnumerable<Metric>>> GetTrending(
        [FromQuery] int hours = 24, 
        [FromQuery] int limit = 10) =>
        Ok(await _service.GetTrendingMetricsAsync(hours, limit));

    [HttpGet("aggregated")]
    public async Task<ActionResult<Dictionary<string, double>>> GetAggregated(
        [FromQuery] DateTime start, 
        [FromQuery] DateTime end, 
        [FromQuery] string aggregation = "avg") =>
        Ok(await _service.GetAggregatedMetricsAsync(start, end, aggregation));

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<Metric>>> GetByStatus(MetricStatus status, [FromQuery] int limit = 100) =>
        Ok(await _service.GetMetricsByStatusAsync(status, limit));

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories() =>
        Ok(await _service.GetCategoriesAsync());

    [HttpGet("count")]
    public async Task<ActionResult<long>> GetTotalCount() =>
        Ok(await _service.GetTotalMetricsCountAsync());

    [HttpPost]
    public async Task<ActionResult<Metric>> Create([FromBody] CreateMetricDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var metric = new Metric
        {
            Name = dto.Name,
            Value = dto.Value,
            Category = dto.Category,
            Unit = dto.Unit,
            Description = dto.Description,
            Metadata = dto.Metadata,
            Source = dto.Source,
            Threshold = dto.Threshold,
            Timestamp = DateTime.UtcNow
        };

        var created = await _service.InsertAsync(metric);
        await _hub.Clients.All.SendAsync("metricAdded", created);

        return CreatedAtAction(nameof(GetLatest), new { limit = 1 }, created);
    }

    [HttpPost("batch")]
    public async Task<ActionResult<IEnumerable<Metric>>> CreateBatch([FromBody] List<CreateMetricDto> dtos)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var metrics = new List<Metric>();
        foreach (var dto in dtos)
        {
            var metric = new Metric
            {
                Name = dto.Name,
                Value = dto.Value,
                Category = dto.Category,
                Unit = dto.Unit,
                Description = dto.Description,
                Metadata = dto.Metadata,
                Source = dto.Source,
                Threshold = dto.Threshold,
                Timestamp = DateTime.UtcNow
            };

            var created = await _service.InsertAsync(metric);
            metrics.Add(created);
        }

        await _hub.Clients.All.SendAsync("metricsBatchAdded", metrics);
        return CreatedAtAction(nameof(GetLatest), new { limit = metrics.Count }, metrics);
    }
}
 