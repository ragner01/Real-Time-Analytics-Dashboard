using System.ComponentModel.DataAnnotations;

namespace Real_Time_Analytics_Dashboard.Models;

public class CreateMetricDto
{
    [Required]
    public string Name { get; set; } = null!;

    public double Value { get; set; }

    public string Category { get; set; } = "General";

    public string Unit { get; set; } = "";

    public string Description { get; set; } = "";

    public Dictionary<string, object> Metadata { get; set; } = new();

    public string Source { get; set; } = "System";

    public double? Threshold { get; set; }
}
