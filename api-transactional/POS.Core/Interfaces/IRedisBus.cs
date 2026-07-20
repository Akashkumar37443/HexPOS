using System.Threading;
using System.Threading.Tasks;

namespace POS.Core.Interfaces
{
    public interface IRedisBus
    {
        Task PublishAsync<T>(string channel, T message, CancellationToken cancellationToken = default);
    }
}
