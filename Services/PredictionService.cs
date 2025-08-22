using MongoDB.Driver;
using Real_Time_Analytics_Dashboard.Models;

namespace Real_Time_Analytics_Dashboard.Services;

public class PredictionService
{
    private readonly IMongoCollection<Prediction> _predictions;
    private readonly MetricService _metricService;

    public PredictionService(MongoService mongo, MetricService metricService)
    {
        _predictions = mongo.Collection<Prediction>("predictions");
        _metricService = metricService;
    }

    public async Task<List<Prediction>> GetPredictionsAsync(string metricName, int limit = 100) =>
        await _predictions.Find(p => p.MetricName == metricName && p.IsActive)
                         .SortByDescending(p => p.PredictionDate)
                         .Limit(limit)
                         .ToListAsync();

    public async Task<Prediction> CreatePredictionAsync(Prediction prediction)
    {
        await _predictions.InsertOneAsync(prediction);
        return prediction;
    }

    public async Task<object> GeneratePredictionAsync(PredictionRequest request)
    {
        // Get historical data for the metric
        var endDate = DateTime.UtcNow;
        var startDate = endDate.AddDays(-90); // Use 90 days of historical data
        var historicalData = await _metricService.GetByTimeRangeAsync(startDate, endDate, null);

        // Filter by metric name if specified
        var metricData = historicalData.Where(m => m.Name == request.MetricName).ToList();

        if (!metricData.Any())
            throw new ArgumentException($"No historical data found for metric: {request.MetricName}");

        // Sort by timestamp
        metricData = metricData.OrderBy(m => m.Timestamp).ToList();

        var predictions = new List<Prediction>();
        var baseDate = endDate;

        for (int i = 1; i <= request.ForecastPeriods; i++)
        {
            var predictionDate = baseDate.AddDays(i);
            var predictedValue = CalculatePredictedValue(metricData, request.ModelType, request.Parameters);
            var confidence = CalculateConfidence(metricData, request.ModelType);

            var prediction = new Prediction
            {
                MetricName = request.MetricName,
                ModelType = request.ModelType,
                PredictionDate = predictionDate,
                PredictedValue = predictedValue,
                Confidence = confidence,
                ModelParameters = request.Parameters,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            predictions.Add(prediction);
            await CreatePredictionAsync(prediction);
        }

        return new
        {
            MetricName = request.MetricName,
            ModelType = request.ModelType,
            ForecastPeriods = request.ForecastPeriods,
            Predictions = predictions,
            GeneratedAt = DateTime.UtcNow,
            HistoricalDataPoints = metricData.Count,
            TimeRange = new { Start = startDate, End = endDate }
        };
    }

    private double CalculatePredictedValue(List<Metric> historicalData, string modelType, Dictionary<string, object> parameters)
    {
        return modelType switch
        {
            "linear" => CalculateLinearPrediction(historicalData),
            "exponential" => CalculateExponentialPrediction(historicalData),
            "moving_average" => CalculateMovingAveragePrediction(historicalData, parameters),
            "trend" => CalculateTrendPrediction(historicalData),
            _ => CalculateLinearPrediction(historicalData)
        };
    }

    private double CalculateLinearPrediction(List<Metric> data)
    {
        if (data.Count < 2) return data.LastOrDefault()?.Value ?? 0;

        var n = data.Count;
        var sumX = 0.0;
        var sumY = 0.0;
        var sumXY = 0.0;
        var sumX2 = 0.0;

        for (int i = 0; i < n; i++)
        {
            var x = i; // Use index as X (time)
            var y = data[i].Value;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        var intercept = (sumY - slope * sumX) / n;

        return slope * n + intercept; // Predict next value
    }

    private double CalculateExponentialPrediction(List<Metric> data)
    {
        if (data.Count < 2) return data.LastOrDefault()?.Value ?? 0;

        var values = data.Select(m => m.Value).ToList();
        var growthRate = CalculateGrowthRate(values);
        var lastValue = values.Last();

        return lastValue * Math.Pow(1 + growthRate, 1);
    }

    private double CalculateGrowthRate(List<double> values)
    {
        if (values.Count < 2) return 0;

        var growthRates = new List<double>();
        for (int i = 1; i < values.Count; i++)
        {
            if (values[i - 1] != 0)
            {
                var rate = (values[i] - values[i - 1]) / values[i - 1];
                growthRates.Add(rate);
            }
        }

        return growthRates.Any() ? growthRates.Average() : 0;
    }

    private double CalculateMovingAveragePrediction(List<Metric> data, Dictionary<string, object> parameters)
    {
        var windowSize = parameters.ContainsKey("windowSize") ? Convert.ToInt32(parameters["windowSize"]) : 7;
        if (data.Count < windowSize) return data.LastOrDefault()?.Value ?? 0;

        var recentValues = data.TakeLast(windowSize).Select(m => m.Value);
        return recentValues.Average();
    }

    private double CalculateTrendPrediction(List<Metric> data)
    {
        if (data.Count < 3) return data.LastOrDefault()?.Value ?? 0;

        var recentTrend = data.TakeLast(3).Select(m => m.Value).ToList();
        var trend = (recentTrend[2] - recentTrend[0]) / 2; // Simple trend calculation

        return data.Last().Value + trend;
    }

    private double CalculateConfidence(List<Metric> data, string modelType)
    {
        if (data.Count < 2) return 0.5;

        // Calculate R-squared for linear models
        if (modelType == "linear")
        {
            var values = data.Select(m => m.Value).ToList();
            var mean = values.Average();
            
            var totalSS = values.Sum(v => Math.Pow(v - mean, 2));
            var residualSS = CalculateResidualSumOfSquares(data);
            
            if (totalSS == 0) return 0.5;
            
            var rSquared = 1 - (residualSS / totalSS);
            return Math.Max(0, Math.Min(1, rSquared)); // Clamp between 0 and 1
        }

        // For other models, use a simpler confidence calculation
        var volatility = CalculateVolatility(data);
        var baseConfidence = 0.7; // Base confidence
        var volatilityPenalty = Math.Min(0.3, volatility * 0.1);

        return Math.Max(0.1, baseConfidence - volatilityPenalty);
    }

    private double CalculateResidualSumOfSquares(List<Metric> data)
    {
        if (data.Count < 2) return 0;

        var n = data.Count;
        var sumX = 0.0;
        var sumY = 0.0;
        var sumXY = 0.0;
        var sumX2 = 0.0;

        for (int i = 0; i < n; i++)
        {
            var x = i;
            var y = data[i].Value;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        var intercept = (sumY - slope * sumX) / n;

        var residuals = new List<double>();
        for (int i = 0; i < n; i++)
        {
            var predicted = slope * i + intercept;
            var residual = data[i].Value - predicted;
            residuals.Add(residual);
        }

        return residuals.Sum(r => r * r);
    }

    private double CalculateVolatility(List<Metric> data)
    {
        if (data.Count < 2) return 0;

        var values = data.Select(m => m.Value).ToList();
        var mean = values.Average();
        var variance = values.Sum(v => Math.Pow(v - mean, 2)) / values.Count;
        
        return Math.Sqrt(variance);
    }
}
