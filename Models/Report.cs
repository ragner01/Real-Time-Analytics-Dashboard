using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Real_Time_Analytics_Dashboard.Models;

public class Report
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = "";

    public string UserId { get; set; } = null!;

    public ReportType Type { get; set; }

    public ReportSchedule Schedule { get; set; } = ReportSchedule.Manual;

    public List<ReportFilter> Filters { get; set; } = new();

    public List<ReportColumn> Columns { get; set; } = new();

    public List<ReportChart> Charts { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastRunAt { get; set; }

    public bool IsActive { get; set; } = true;
}

public enum ReportType
{
    Summary,
    Detailed,
    Trend,
    Comparison,
    Custom
}

public enum ReportSchedule
{
    Manual,
    Daily,
    Weekly,
    Monthly
}

public class ReportFilter
{
    public string Field { get; set; } = null!;

    public string Operator { get; set; } = null!; // "equals", "contains", "greater", "less"

    public object Value { get; set; } = null!;
}

public class ReportColumn
{
    public string Field { get; set; } = null!;

    public string DisplayName { get; set; } = null!;

    public string DataType { get; set; } = "string";

    public bool IsVisible { get; set; } = true;

    public string? Format { get; set; }
}

public class ReportChart
{
    public string Type { get; set; } = null!; // "line", "bar", "pie", "area"

    public string Title { get; set; } = null!;

    public string XAxis { get; set; } = null!;

    public string YAxis { get; set; } = null!;

    public Dictionary<string, object> Options { get; set; } = new();
}
