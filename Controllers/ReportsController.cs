using Microsoft.AspNetCore.Mvc;
using Real_Time_Analytics_Dashboard.Models;
using Real_Time_Analytics_Dashboard.Services;

namespace Real_Time_Analytics_Dashboard.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _service;

    public ReportsController(ReportService service)
    {
        _service = service;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Report>>> GetUserReports(string userId) =>
        Ok(await _service.GetUserReportsAsync(userId));

    [HttpGet("{id}")]
    public async Task<ActionResult<Report>> GetReport(string id)
    {
        var report = await _service.GetReportAsync(id);
        return report != null ? Ok(report) : NotFound();
    }

    [HttpPost]
    public async Task<ActionResult<Report>> Create([FromBody] Report report)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var created = await _service.CreateReportAsync(report);
        return CreatedAtAction(nameof(GetUserReports), new { userId = report.UserId }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, [FromBody] Report report)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var success = await _service.UpdateReportAsync(id, report);
        return success ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var success = await _service.DeleteReportAsync(id);
        return success ? NoContent() : NotFound();
    }

    [HttpPost("{id}/generate")]
    public async Task<ActionResult<object>> GenerateReport(
        string id, 
        [FromQuery] DateTime? startDate = null, 
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var result = await _service.GenerateReportAsync(id, startDate, endDate);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/export")]
    public async Task<ActionResult> ExportReport(
        string id, 
        [FromQuery] string format = "json",
        [FromQuery] DateTime? startDate = null, 
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var result = await _service.GenerateReportAsync(id, startDate, endDate);
            
            return format.ToLower() switch
            {
                "csv" => File(GenerateCsv(result), "text/csv", $"report_{id}_{DateTime.UtcNow:yyyyMMdd}.csv"),
                "json" => File(System.Text.Json.JsonSerializer.SerializeToUtf8Bytes(result), "application/json", $"report_{id}_{DateTime.UtcNow:yyyyMMdd}.json"),
                _ => BadRequest("Unsupported export format. Use 'csv' or 'json'.")
            };
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private byte[] GenerateCsv(object reportData)
    {
        // Simple CSV generation for report data
        var csv = new System.Text.StringBuilder();
        
        // Add headers
        csv.AppendLine("Report Data");
        csv.AppendLine($"Generated: {DateTime.UtcNow}");
        csv.AppendLine();
        
        // Add data rows (this is a simplified version)
        csv.AppendLine("Metric,Value,Timestamp,Category");
        
        // You would iterate through the actual report data here
        // For now, just return a basic CSV structure
        
        return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
    }
}
