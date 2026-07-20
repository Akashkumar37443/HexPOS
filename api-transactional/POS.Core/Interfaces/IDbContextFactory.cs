using System.Threading;
using System.Threading.Tasks;

namespace POS.Core.Interfaces
{
    public interface IDbContextFactory
    {
        Task<IPOSDbContext> CreateDbContextAsync(CancellationToken cancellationToken = default);
    }
}
