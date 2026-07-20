using System.Threading;
using System.Threading.Tasks;
using POS.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace POS.Infrastructure.Data
{
    public class DbContextFactory : IDbContextFactory
    {
        private readonly IDbContextFactory<POSDbContext> _efFactory;

        public DbContextFactory(IDbContextFactory<POSDbContext> efFactory)
        {
            _efFactory = efFactory;
        }

        public async Task<IPOSDbContext> CreateDbContextAsync(CancellationToken cancellationToken = default)
        {
            return await _efFactory.CreateDbContextAsync(cancellationToken);
        }
    }
}
