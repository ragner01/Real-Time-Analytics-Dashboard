using Microsoft.AspNetCore.Mvc;
using Real_Time_Analytics_Dashboard.Models;
using Real_Time_Analytics_Dashboard.Services;

namespace Real_Time_Analytics_Dashboard.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardsController : ControllerBase
{
    private readonly DashboardService _service;
    

    public DashboardsController(DashboardService service)
    {
        _service = service;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Dashboard>>> GetUserDashboards(string userId) =>
        Ok(await _service.GetUserDashboardsAsync(userId));

    [HttpGet("user/{userId}/default")]
    public async Task<ActionResult<Dashboard?>> GetDefaultDashboard(string userId)
    {
        var dashboard = await _service.GetDefaultDashboardAsync(userId);
        return dashboard != null ? Ok(dashboard) : NotFound();
    }

    [HttpPost]
    public async Task<ActionResult<Dashboard>> Create([FromBody] Dashboard dashboard)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var created = await _service.CreateDashboardAsync(dashboard);
        return CreatedAtAction(nameof(GetUserDashboards), new { userId = dashboard.UserId }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, [FromBody] Dashboard dashboard)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var success = await _service.UpdateDashboardAsync(id, dashboard);
        return success ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var success = await _service.DeleteDashboardAsync(id);
        return success ? NoContent() : NotFound();
    }

    [HttpPut("{dashboardId}/widgets/{widgetId}")]
    public async Task<ActionResult> UpdateWidget(string dashboardId, string widgetId, [FromBody] DashboardWidget widget)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var success = await _service.UpdateWidgetAsync(dashboardId, widgetId, widget);
        return success ? NoContent() : NotFound();
    }
}
