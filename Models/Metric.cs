using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Real_Time_Analytics_Dashboard.Models;

public class Metric
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    public double Value { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string Category { get; set; } = "General";

    public string Unit { get; set; } = "";

    public string Description { get; set; } = "";

    public Dictionary<string, object> Metadata { get; set; } = new();

    public string Source { get; set; } = "System";

    public MetricStatus Status { get; set; } = MetricStatus.Normal;

    public double? Threshold { get; set; }

    public double? PreviousValue { get; set; }

    public double? ChangePercentage { get; set; }
}

public enum MetricStatus
{
    Normal,
    Warning,
    Critical,
    Unknown
}
