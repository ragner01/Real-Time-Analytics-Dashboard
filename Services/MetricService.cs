using MongoDB.Driver;
using MongoDB.Bson;
using Real_Time_Analytics_Dashboard.Models;

namespace Real_Time_Analytics_Dashboard.Services;

public class MetricService
{
    private readonly IMongoCollection<Metric> _metrics;

    public MetricService(MongoService mongo)
    {
        _metrics = mongo.Collection<Metric>("metrics");
    }

    public async Task<List<Metric>> GetLatestAsync(int limit = 50) =>
        await _metrics.Find(FilterDefinition<Metric>.Empty)
                      .SortByDescending(m => m.Timestamp)
                      .Limit(limit)
                      .ToListAsync();

    public async Task<Metric> InsertAsync(Metric metric)
    {
        // Calculate change percentage if previous value exists
        var previousMetric = await _metrics.Find(m => m.Name == metric.Name)
                                          .SortByDescending(m => m.Timestamp)
                                          .FirstOrDefaultAsync();
        
        if (previousMetric != null)
        {
            metric.PreviousValue = previousMetric.Value;
            metric.ChangePercentage = ((metric.Value - previousMetric.Value) / previousMetric.Value) * 100;
            
            // Set status based on threshold
            if (metric.Threshold.HasValue)
            {
                metric.Status = metric.Value > metric.Threshold.Value ? MetricStatus.Critical : MetricStatus.Normal;
            }
        }

        await _metrics.InsertOneAsync(metric);
        return metric;
    }

    public async Task<List<Metric>> GetByCategoryAsync(string category, int limit = 100) =>
        await _metrics.Find(m => m.Category == category)
                      .SortByDescending(m => m.Timestamp)
                      .Limit(limit)
                      .ToListAsync();

    public async Task<List<Metric>> GetByTimeRangeAsync(DateTime start, DateTime end, string? category = null)
    {
        var filter = Builders<Metric>.Filter.Gte(m => m.Timestamp, start) &
                    Builders<Metric>.Filter.Lte(m => m.Timestamp, end);
        
        if (!string.IsNullOrEmpty(category))
        {
            filter &= Builders<Metric>.Filter.Eq(m => m.Category, category);
        }

        return await _metrics.Find(filter)
                           .SortBy(m => m.Timestamp)
                           .ToListAsync();
    }

    public async Task<List<Metric>> GetTrendingMetricsAsync(int hours = 24, int limit = 10)
    {
        var cutoff = DateTime.UtcNow.AddHours(-hours);
        
        var pipeline = new[]
        {
            new BsonDocument("$match", new BsonDocument("timestamp", new BsonDocument("$gte", cutoff))),
            new BsonDocument("$group", new BsonDocument
            {
                { "_id", "$name" },
                { "avgValue", new BsonDocument("$avg", "$value") },
                { "count", new BsonDocument("$sum", 1) },
                { "latestValue", new BsonDocument("$last", "$value") },
                { "latestTimestamp", new BsonDocument("$last", "$timestamp") },
                { "category", new BsonDocument("$last", "$category") }
            }),
            new BsonDocument("$sort", new BsonDocument("count", -1)),
            new BsonDocument("$limit", limit)
        };

        var results = await _metrics.Aggregate<BsonDocument>(pipeline).ToListAsync();
        
        return results.Select(doc => new Metric
        {
            Name = doc["_id"].AsString,
            Value = doc["latestValue"].AsDouble,
            Timestamp = doc["latestTimestamp"].ToUniversalTime(),
            Category = doc["category"].AsString
        }).ToList();
    }

    public async Task<Dictionary<string, double>> GetAggregatedMetricsAsync(DateTime start, DateTime end, string aggregation = "avg")
    {
        var filter = Builders<Metric>.Filter.Gte(m => m.Timestamp, start) &
                    Builders<Metric>.Filter.Lte(m => m.Timestamp, end);

        var metrics = await _metrics.Find(filter).ToListAsync();
        
        if (aggregation == "avg")
        {
            return metrics.GroupBy(m => m.Name)
                         .ToDictionary(g => g.Key, g => g.Average(m => m.Value));
        }
        else if (aggregation == "sum")
        {
            return metrics.GroupBy(m => m.Name)
                         .ToDictionary(g => g.Key, g => g.Sum(m => m.Value));
        }
        else if (aggregation == "min")
        {
            return metrics.GroupBy(m => m.Name)
                         .ToDictionary(g => g.Key, g => g.Min(m => m.Value));
        }
        else if (aggregation == "max")
        {
            return metrics.GroupBy(m => m.Name)
                         .ToDictionary(g => g.Key, g => g.Max(m => m.Value));
        }
        
        // Default to average
        return metrics.GroupBy(m => m.Name)
                     .ToDictionary(g => g.Key, g => g.Average(m => m.Value));
    }

    public async Task<List<Metric>> GetMetricsByStatusAsync(MetricStatus status, int limit = 100) =>
        await _metrics.Find(m => m.Status == status)
                      .SortByDescending(m => m.Timestamp)
                      .Limit(limit)
                      .ToListAsync();

    public async Task<long> GetTotalMetricsCountAsync() =>
        await _metrics.CountDocumentsAsync(FilterDefinition<Metric>.Empty);

    public async Task<List<string>> GetCategoriesAsync() =>
        await _metrics.Distinct(m => m.Category, FilterDefinition<Metric>.Empty).ToListAsync();
}
