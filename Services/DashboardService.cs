using MongoDB.Driver;
using Real_Time_Analytics_Dashboard.Models;

namespace Real_Time_Analytics_Dashboard.Services;

public class DashboardService
{
    private readonly IMongoCollection<Dashboard> _dashboards;

    public DashboardService(MongoService mongo)
    {
        _dashboards = mongo.Collection<Dashboard>("dashboards");
    }

    public async Task<List<Dashboard>> GetUserDashboardsAsync(string userId) =>
        await _dashboards.Find(d => d.UserId == userId)
                        .SortByDescending(d => d.UpdatedAt)
                        .ToListAsync();

    public async Task<Dashboard?> GetDefaultDashboardAsync(string userId) =>
        await _dashboards.Find(d => d.UserId == userId && d.IsDefault)
                        .FirstOrDefaultAsync();

    public async Task<Dashboard> CreateDashboardAsync(Dashboard dashboard)
    {
        if (dashboard.IsDefault)
        {
            // Remove default flag from other dashboards
            var update = Builders<Dashboard>.Update.Set(d => d.IsDefault, false);
            await _dashboards.UpdateManyAsync(d => d.UserId == dashboard.UserId, update);
        }

        await _dashboards.InsertOneAsync(dashboard);
        return dashboard;
    }

    public async Task<bool> UpdateDashboardAsync(string id, Dashboard dashboard)
    {
        dashboard.UpdatedAt = DateTime.UtcNow;
        
        if (dashboard.IsDefault)
        {
            // Remove default flag from other dashboards
            var update = Builders<Dashboard>.Update.Set(d => d.IsDefault, false);
            await _dashboards.UpdateManyAsync(d => d.UserId == dashboard.UserId, update);
        }

        var result = await _dashboards.ReplaceOneAsync(d => d.Id == id, dashboard);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteDashboardAsync(string id) =>
        (await _dashboards.DeleteOneAsync(d => d.Id == id)).DeletedCount > 0;

    public async Task<bool> UpdateWidgetAsync(string dashboardId, string widgetId, DashboardWidget widget)
    {
        var filter = Builders<Dashboard>.Filter.And(
            Builders<Dashboard>.Filter.Eq(d => d.Id, dashboardId),
            Builders<Dashboard>.Filter.ElemMatch(d => d.Widgets, w => w.Id == widgetId)
        );

        var update = Builders<Dashboard>.Update.Set("Widgets.$", widget);
        var result = await _dashboards.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }
}
