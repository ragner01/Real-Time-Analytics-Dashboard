using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Real_Time_Analytics_Dashboard.Models;

public class Dashboard
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = "";

    public string UserId { get; set; } = null!;

    public bool IsDefault { get; set; } = false;

    public List<DashboardWidget> Widgets { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Dictionary<string, object> Settings { get; set; } = new();
}

public class DashboardWidget
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Type { get; set; } = null!; // "chart", "metric", "table", "gauge"

    public string Title { get; set; } = null!;

    public Dictionary<string, object> Configuration { get; set; } = new();

    public int PositionX { get; set; }

    public int PositionY { get; set; }

    public int Width { get; set; } = 6;

    public int Height { get; set; } = 4;

    public bool IsVisible { get; set; } = true;
}
