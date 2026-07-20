using Microsoft.EntityFrameworkCore;
using POS.Core.Entities;
using POS.Core.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace POS.Infrastructure.Data
{
    public class POSDbContext : DbContext, IPOSDbContext
    {
        private readonly TenantSaveChangesInterceptor _tenantInterceptor;

        public POSDbContext(DbContextOptions<POSDbContext> options, TenantSaveChangesInterceptor tenantInterceptor)
            : base(options)
        {
            _tenantInterceptor = tenantInterceptor;
        }

        public DbSet<Inventory> Inventory { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<FinancialLedger> Ledgers { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (_tenantInterceptor != null)
            {
                optionsBuilder.AddInterceptors(_tenantInterceptor);
            }
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Inventory>().HasKey(i => i.Id);
            modelBuilder.Entity<Order>().HasKey(o => o.Id);
            modelBuilder.Entity<FinancialLedger>().HasKey(f => f.Id);

            base.OnModelCreating(modelBuilder);
        }
    }
}
