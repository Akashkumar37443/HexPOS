using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using POS.Core.Interfaces;
using StackExchange.Redis;

namespace POS.Infrastructure.Services
{
    public class RedisBus : IRedisBus
    {
        private readonly IConnectionMultiplexer _redis;

        public RedisBus(IConnectionMultiplexer redis)
        {
            _redis = redis;
        }

        public async Task PublishAsync<T>(string channel, T message, CancellationToken cancellationToken = default)
        {
            var db = _redis.GetDatabase();
            var json = JsonSerializer.Serialize(message);
            await db.PublishAsync(channel, json);
        }
    }
}
