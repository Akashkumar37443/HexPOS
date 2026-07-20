using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;
using System.Threading;
using System.Threading.Tasks;
using POS.Core.Entities;

namespace POS.Core.Interfaces
{
    public interface IPOSDbContext : IDisposable, IAsyncDisposable
    {
        DbSet<Inventory> Inventory { get; }
        DbSet<Order> Orders { get; }
        DbSet<FinancialLedger> Ledgers { get; }
        DatabaseFacade Database { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
