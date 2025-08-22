using Microsoft.AspNetCore.Mvc;
using Real_Time_Analytics_Dashboard.Models;
using Real_Time_Analytics_Dashboard.Services;

namespace Real_Time_Analytics_Dashboard.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PredictionsController : ControllerBase
{
    private readonly PredictionService _service;

    public PredictionsController(PredictionService service)
    {
        _service = service;
    }

    [HttpGet("metric/{metricName}")]
    public async Task<ActionResult<IEnumerable<Prediction>>> GetPredictions(string metricName, [FromQuery] int limit = 100) =>
        Ok(await _service.GetPredictionsAsync(metricName, limit));

    [HttpPost("generate")]
    public async Task<ActionResult<object>> GeneratePrediction([FromBody] PredictionRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        try
        {
            var result = await _service.GeneratePredictionAsync(request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("batch")]
    public async Task<ActionResult<object>> GenerateBatchPredictions([FromBody] List<PredictionRequest> requests)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var results = new List<object>();
        
        foreach (var request in requests)
        {
            try
            {
                var result = await _service.GeneratePredictionAsync(request);
                results.Add(result);
            }
            catch (ArgumentException ex)
            {
                results.Add(new { Error = ex.Message, MetricName = request.MetricName });
            }
        }

        return Ok(new { Results = results, TotalProcessed = requests.Count });
    }

    [HttpGet("models")]
    public ActionResult<IEnumerable<string>> GetAvailableModels() =>
        Ok(new[] { "linear", "exponential", "moving_average", "trend" });

    [HttpGet("models/{modelType}/parameters")]
    public ActionResult<object> GetModelParameters(string modelType) =>
        modelType switch
        {
            "linear" => Ok(new { Description = "Linear regression model", Parameters = new { } }),
            "exponential" => Ok(new { Description = "Exponential growth model", Parameters = new { } }),
            "moving_average" => Ok(new { Description = "Moving average model", Parameters = new { windowSize = "Number of periods for moving average" } }),
            "trend" => Ok(new { Description = "Simple trend model", Parameters = new { } }),
            _ => NotFound("Model type not found")
        };
}
