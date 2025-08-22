using MongoDB.Driver;
using Real_Time_Analytics_Dashboard.Models;

namespace Real_Time_Analytics_Dashboard.Services;

public class ReportService
{
    private readonly IMongoCollection<Report> _reports;
    private readonly MetricService _metricService;

    public ReportService(MongoService mongo, MetricService metricService)
    {
        _reports = mongo.Collection<Report>("reports");
        _metricService = metricService;
    }

    public async Task<List<Report>> GetUserReportsAsync(string userId) =>
        await _reports.Find(r => r.UserId == userId)
                     .SortByDescending(r => r.UpdatedAt)
                     .ToListAsync();

    public async Task<Report?> GetReportAsync(string id) =>
        await _reports.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<Report> CreateReportAsync(Report report)
    {
        await _reports.InsertOneAsync(report);
        return report;
    }

    public async Task<bool> UpdateReportAsync(string id, Report report)
    {
        report.UpdatedAt = DateTime.UtcNow;
        var result = await _reports.ReplaceOneAsync(r => r.Id == id, report);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteReportAsync(string id) =>
        (await _reports.DeleteOneAsync(r => r.Id == id)).DeletedCount > 0;

    public async Task<object> GenerateReportAsync(string reportId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var report = await GetReportAsync(reportId);
        if (report == null)
            throw new ArgumentException("Report not found");

        startDate ??= DateTime.UtcNow.AddDays(-30);
        endDate ??= DateTime.UtcNow;

        var metrics = await _metricService.GetByTimeRangeAsync(startDate.Value, endDate.Value);

        // Apply filters
        var filteredMetrics = ApplyFilters(metrics, report.Filters);

        // Group by time periods for trend analysis
        var groupedData = GroupMetricsByTime(filteredMetrics, startDate.Value, endDate.Value);

        var result = new
        {
            ReportId = reportId,
            GeneratedAt = DateTime.UtcNow,
            TimeRange = new { Start = startDate, End = endDate },
            Summary = new
            {
                TotalRecords = filteredMetrics.Count,
                Categories = filteredMetrics.GroupBy(m => m.Category)
                                         .Select(g => new { Category = g.Key, Count = g.Count() })
                                         .ToList(),
                AverageValue = filteredMetrics.Any() ? filteredMetrics.Average(m => m.Value) : 0
            },
            Data = filteredMetrics,
            GroupedData = groupedData,
            Charts = GenerateChartData(report.Charts, filteredMetrics, groupedData)
        };

        // Update last run time
        await _reports.UpdateOneAsync(r => r.Id == reportId, 
            Builders<Report>.Update.Set(r => r.LastRunAt, DateTime.UtcNow));

        return result;
    }

    private List<Metric> ApplyFilters(List<Metric> metrics, List<ReportFilter> filters)
    {
        var filtered = metrics;
        
        foreach (var filter in filters)
        {
            filtered = filter.Operator switch
            {
                "equals" => filtered.Where(m => GetPropertyValue(m, filter.Field)?.ToString() == filter.Value?.ToString()).ToList(),
                "contains" => filtered.Where(m => GetPropertyValue(m, filter.Field)?.ToString()?.Contains(filter.Value?.ToString() ?? "") == true).ToList(),
                "greater" => filtered.Where(m => Convert.ToDouble(GetPropertyValue(m, filter.Field)) > Convert.ToDouble(filter.Value)).ToList(),
                "less" => filtered.Where(m => Convert.ToDouble(GetPropertyValue(m, filter.Field)) < Convert.ToDouble(filter.Value)).ToList(),
                _ => filtered
            };
        }

        return filtered;
    }

    private object? GetPropertyValue(Metric metric, string field) =>
        field switch
        {
            "Name" => metric.Name,
            "Value" => metric.Value,
            "Category" => metric.Category,
            "Source" => metric.Source,
            "Status" => metric.Status,
            _ => null
        };

    private Dictionary<string, List<Metric>> GroupMetricsByTime(List<Metric> metrics, DateTime start, DateTime end)
    {
        var grouped = new Dictionary<string, List<Metric>>();
        var interval = TimeSpan.FromHours(1); // 1-hour intervals

        for (var time = start; time <= end; time += interval)
        {
            var key = time.ToString("yyyy-MM-dd HH:00");
            var periodMetrics = metrics.Where(m => m.Timestamp >= time && m.Timestamp < time + interval).ToList();
            if (periodMetrics.Any())
            {
                grouped[key] = periodMetrics;
            }
        }

        return grouped;
    }

    private List<object> GenerateChartData(List<ReportChart> charts, List<Metric> metrics, Dictionary<string, List<Metric>> groupedData)
    {
        var chartData = new List<object>();

        foreach (var chart in charts)
        {
            var data = chart.Type switch
            {
                "line" => GenerateLineChartData(chart, groupedData),
                "bar" => GenerateBarChartData(chart, metrics),
                "pie" => GeneratePieChartData(chart, metrics),
                "area" => GenerateAreaChartData(chart, groupedData),
                _ => new { }
            };

            chartData.Add(new
            {
                Type = chart.Type,
                Title = chart.Title,
                Data = data
            });
        }

        return chartData;
    }

    private object GenerateLineChartData(ReportChart chart, Dictionary<string, List<Metric>> groupedData)
    {
        var labels = groupedData.Keys.OrderBy(k => k).ToList();
        var values = labels.Select(key => groupedData[key].Average(m => m.Value)).ToList();

        return new
        {
            Labels = labels,
            Datasets = new[]
            {
                new
                {
                    Label = chart.YAxis,
                    Data = values,
                    BorderColor = "rgb(75, 192, 192)",
                    Tension = 0.1
                }
            }
        };
    }

    private object GenerateBarChartData(ReportChart chart, List<Metric> metrics)
    {
        var grouped = metrics.GroupBy(m => m.Category)
                           .Select(g => new { Category = g.Key, Value = g.Average(m => m.Value) })
                           .ToList();

        return new
        {
            Labels = grouped.Select(g => g.Category).ToList(),
            Datasets = new[]
            {
                new
                {
                    Label = chart.YAxis,
                    Data = grouped.Select(g => g.Value).ToList(),
                    BackgroundColor = "rgba(54, 162, 235, 0.2)",
                    BorderColor = "rgba(54, 162, 235, 1)",
                    BorderWidth = 1
                }
            }
        };
    }

    private object GeneratePieChartData(ReportChart chart, List<Metric> metrics)
    {
        var grouped = metrics.GroupBy(m => m.Category)
                           .Select(g => new { Category = g.Key, Value = g.Count() })
                           .ToList();

        return new
        {
            Labels = grouped.Select(g => g.Category).ToList(),
            Datasets = new[]
            {
                new
                {
                    Data = grouped.Select(g => g.Value).ToList(),
                    BackgroundColor = new[]
                    {
                        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                        "#FF9F40", "#FF6384", "#C9CBCF", "#4BC0C0", "#FF6384"
                    }
                }
            }
        };
    }

    private object GenerateAreaChartData(ReportChart chart, Dictionary<string, List<Metric>> groupedData)
    {
        var labels = groupedData.Keys.OrderBy(k => k).ToList();
        var values = labels.Select(key => groupedData[key].Average(m => m.Value)).ToList();

        return new
        {
            Labels = labels,
            Datasets = new[]
            {
                new
                {
                    Label = chart.YAxis,
                    Data = values,
                    BackgroundColor = "rgba(75, 192, 192, 0.2)",
                    BorderColor = "rgb(75, 192, 192)",
                    Fill = true
                }
            }
        };
    }
}
