using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Real_Time_Analytics_Dashboard.Models;

public class Prediction
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string MetricName { get; set; } = null!;

    public string ModelType { get; set; } = null!; // "linear", "exponential", "arima", "ml"

    public DateTime PredictionDate { get; set; }

    public double PredictedValue { get; set; }

    public double Confidence { get; set; } // 0-1

    public double? LowerBound { get; set; }

    public double? UpperBound { get; set; }

    public Dictionary<string, object> ModelParameters { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    public string? Notes { get; set; }
}

public class PredictionRequest
{
    public string MetricName { get; set; } = null!;

    public string ModelType { get; set; } = "linear";

    public int ForecastPeriods { get; set; } = 30;

    public Dictionary<string, object> Parameters { get; set; } = new();
}
