using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Real_Time_Analytics_Dashboard.Services;

public class MongoOptions
{
    public string ConnectionString { get; set; } = null!;
    public string Database { get; set; } = null!;
}

public class MongoService
{
    private readonly IMongoDatabase _db;

    public MongoService(IOptions<MongoOptions> options)
    {
        var client = new MongoClient(options.Value.ConnectionString);
        _db = client.GetDatabase(options.Value.Database);
    }

    public IMongoCollection<T> Collection<T>(string name) => _db.GetCollection<T>(name);
}
