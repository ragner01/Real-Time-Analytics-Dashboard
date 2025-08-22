using Microsoft.AspNetCore.SignalR;

namespace Real_Time_Analytics_Dashboard.Hubs;

public class AnalyticsHub : Hub
{
    public async Task JoinDashboardGroup(string dashboardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"dashboard_{dashboardId}");
    }

    public async Task LeaveDashboardGroup(string dashboardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"dashboard_{dashboardId}");
    }

    public async Task JoinMetricGroup(string metricName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"metric_{metricName}");
    }

    public async Task LeaveMetricGroup(string metricName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"metric_{metricName}");
    }

    public async Task JoinReportGroup(string reportId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"report_{reportId}");
    }

    public async Task LeaveReportGroup(string reportId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"report_{reportId}");
    }

    public async Task UpdateDashboardWidget(string dashboardId, string widgetId, object widgetData)
    {
        await Clients.Group($"dashboard_{dashboardId}").SendAsync("widgetUpdated", widgetId, widgetData);
    }

    public async Task RefreshDashboard(string dashboardId)
    {
        await Clients.Group($"dashboard_{dashboardId}").SendAsync("dashboardRefresh");
    }

    public async Task ReportGenerated(string reportId, object reportData)
    {
        await Clients.Group($"report_{reportId}").SendAsync("reportReady", reportData);
    }

    public async Task PredictionComplete(string metricName, object predictionData)
    {
        await Clients.Group($"metric_{metricName}").SendAsync("predictionReady", predictionData);
    }
}

